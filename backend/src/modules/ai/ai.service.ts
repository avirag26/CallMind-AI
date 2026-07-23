import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OpenAIProvider } from './providers/openai.provider';
import { Message } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiProvider: OpenAIProvider,
    ) { }

    async onModuleInit() {
        this.aiProvider.initialize();
    }

    async getConversation(callId: string) {
        let conversation = await this.prisma.conversation.findFirst({
            where: { callId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!conversation) {
            // Auto-initialize if it doesn't exist (useful for calls that transitioned before AI was fully implemented)
            await this.initializeConversation(callId);

            conversation = await this.prisma.conversation.findFirst({
                where: { callId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });

            if (!conversation) {
                throw new NotFoundException('Conversation not found');
            }
        }

        return conversation;
    }

    async initializeConversation(callId: string) {
        let conversation = await this.prisma.conversation.findFirst({ where: { callId } });
        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: { callId },
            });
            const prompt = await this.prisma.promptTemplate.findFirst({
                where: { isActive: true },
            });
            const greeting = prompt?.content.match(/"([^"]+)"/)?.[1] || "Hello. Thank you for calling Cure & Wellness. Our doctors are currently unavailable. One of our doctors will call you within approximately 10 minutes. May I ask you a few questions?";

            await this.saveAiMessage(callId, greeting, null, 'system', 'system');
        }
        return conversation;
    }

    async getSummary(callId: string) {
        const conversation = await this.prisma.conversation.findFirst({ where: { callId } });
        if (!conversation) return null;
        return this.prisma.conversationSummary.findFirst({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async processMessage(callId: string, text: string) {
        const conversation = await this.prisma.conversation.findFirst({ where: { callId } });
        if (!conversation) throw new NotFoundException('Conversation not found');

        // 1. Extract State & Intent FIRST
        const history = await this.prisma.conversationMessage.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'asc' },
        });

        const transcript = history.map(h => `${h.speaker}: ${h.text}`).join('\n') + `\nUSER: ${text}`;
        
        const statePrompt: Message[] = [
            {
                role: 'system',
                content: `Extract the current patient state and intent based on the conversation so far. Output JSON exactly matching this structure: { "name": null, "age": null, "gender": null, "city": null, "phone": null, "concern": null, "symptoms": [], "duration": null, "severity": null, "callbackTime": null, "additionalNotes": null, "intent": "Appointment Request | Emergency | General Inquiry | Returning Patient | Wrong Number | Spam | End Conversation | FAQ | Ongoing" }. If missing, set to null.`
            },
            { role: 'user', content: transcript }
        ];

        let extractedState: any = {};
        let intent = 'Ongoing';
        try {
            const stateResponse = await this.aiProvider.generateJSONResponse(statePrompt);
            const data = JSON.parse(stateResponse.text);
            intent = data.intent || 'Ongoing';
            delete data.intent;
            extractedState = data;
        } catch (e) {
            this.logger.error('Failed to extract state', e);
        }

        // 2. Save USER message with state
        await this.prisma.conversationMessage.create({
            data: {
                conversationId: conversation.id,
                speaker: 'USER',
                text,
                extractedState,
                intent,
            },
        });

        // 3. Build context for generating the reply
        const messages = await this.buildConversationContext(conversation.id, extractedState, intent);

        // Get stream from provider
        return this.aiProvider.generateStream(messages);
    }

    async saveAiMessage(callId: string, text: string, usage: any, model: string, provider: string) {
        let conversation = await this.prisma.conversation.findFirst({ where: { callId } });
        if (!conversation) conversation = await this.prisma.conversation.create({ data: { callId } });
        const conversationId = conversation.id;

        const message = await this.prisma.conversationMessage.create({
            data: {
                conversationId,
                speaker: 'AI',
                text,
                model,
                provider,
            },
        });

        if (usage) {
            await this.prisma.aIUsage.create({
                data: {
                    conversationId,
                    messageId: message.id,
                    promptTokens: usage.promptTokens,
                    completionTokens: usage.completionTokens,
                    totalTokens: usage.totalTokens,
                    model,
                    provider,
                },
            });
        }

        return message;
    }

    private async buildConversationContext(conversationId: string, state?: any, intent?: string): Promise<Message[]> {
        const prompt = await this.prisma.promptTemplate.findFirst({
            where: { isActive: true },
        });

        const messages: Message[] = [];

        let content = prompt?.content || `You are Emma, the friendly receptionist at Cure & Wellness Clinic.
You are talking to callers over the phone using a real-time voice AI. Your goal is to sound like a genuine human receptionist—not like an AI or a chatbot.
Speak naturally, warmly, and confidently. Keep every response short to medium length (usually 1-3 sentences). Avoid long explanations. Don't sound scripted.

Your job is to:
- Welcome the caller.
- Collect the information the doctor needs.
- Answer basic clinic questions.
- Reassure the caller that the doctor will contact them soon.

Never diagnose illnesses, suggest treatments, or provide medical advice.`;

        if (content) {
            if (state) {
                content += `\n\nCURRENT STATE (Do NOT ask for information already known):\n${JSON.stringify(state, null, 2)}`;
            }
            if (intent === 'Emergency') {
                content += `\n\nCRITICAL RULE: The user has indicated a potential emergency. Do NOT continue normal flow. Politely advise immediate emergency medical attention and stop collecting non-essential details.`;
            } else {
                content += `\n\nRULES:
1. Dynamically decide what to ask next based on the CURRENT STATE. Never ask for information already known.
2. Ask intelligent follow-up questions (e.g. Back pain -> How long? Severity? Recent injury?).
3. Never diagnose, never prescribe medication, never claim certainty, never replace a doctor. Collect information only.
4. If user changes topic, answer briefly, then continue information collection.
5. Never repeat questions.
6. CRITICAL: This is a real-time VOICE call. ALWAYS keep your responses extremely short, conversational, and natural. Speak like a human receptionist (1-2 short sentences maximum). NEVER output bullet points, long lists, or markdown formatting.`;
            }
            messages.push({ role: 'system', content });
        }

        const history = await this.prisma.conversationMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });

        history.forEach(msg => {
            messages.push({
                role: msg.speaker === 'USER' ? 'user' : 'assistant',
                content: msg.text,
            });
        });

        return messages;
    }

    async generateSummary(callId: string) {
        const conversation = await this.prisma.conversation.findFirst({ where: { callId } });
        if (!conversation) return null;
        const conversationId = conversation.id;

        const history = await this.prisma.conversationMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });

        if (history.length === 0) return null;

        const transcript = history.map(h => `${h.speaker}: ${h.text}`).join('\n');

        const summaryPrompt: Message[] = [
            {
                role: 'system',
                content: `Analyze the following patient-receptionist conversation transcript. Output JSON with exactly these keys:
{
    "summary": { "patientName": null, "phone": null, "age": null, "gender": null, "concern": null, "symptoms": null, "duration": null, "urgency": null, "preferredCallback": null, "additionalNotes": null, "shortSummary": null },
    "qualityScore": { "quality": null, "missingInfo": null, "confidence": null, "suggestedAction": null },
    "doctorReport": { "patientSummary": null, "timeline": null, "priority": null, "callbackRec": null, "urgency": null }
}
All values must be strings or null (for symptoms, use a single comma-separated string). If a field is not mentioned, set its value to null. Output ONLY raw JSON.`
            },
            {
                role: 'user',
                content: transcript
            }
        ];

        try {
            const response = await this.aiProvider.generateJSONResponse(summaryPrompt);
            const data = JSON.parse(response.text);
            const summaryData = data.summary || {};
            const qualityData = data.qualityScore || {};
            const doctorData = data.doctorReport || {};

            const summary = await this.prisma.conversationSummary.create({
                data: {
                    conversationId,
                    patientName: this.toNullableString(summaryData.patientName),
                    phone: this.toNullableString(summaryData.phone),
                    age: this.toNullableString(summaryData.age),
                    gender: this.toNullableString(summaryData.gender),
                    concern: this.toNullableString(summaryData.concern),
                    symptoms: this.toNullableString(summaryData.symptoms),
                    duration: this.toNullableString(summaryData.duration),
                    urgency: this.toNullableString(summaryData.urgency),
                    preferredCallback: this.toNullableString(summaryData.preferredCallback),
                    additionalNotes: this.toNullableString(summaryData.additionalNotes),
                    shortSummary: this.toNullableString(summaryData.shortSummary),
                }
            });

            await this.prisma.qualityScore.create({
                data: {
                    conversationId,
                    quality: this.toNullableString(qualityData.quality),
                    missingInfo: this.toNullableString(qualityData.missingInfo),
                    confidence: this.toNullableString(qualityData.confidence),
                    suggestedAction: this.toNullableString(qualityData.suggestedAction),
                }
            });

            await this.prisma.doctorReport.create({
                data: {
                    conversationId,
                    patientSummary: this.toNullableString(doctorData.patientSummary),
                    timeline: this.toNullableString(doctorData.timeline),
                    priority: this.toNullableString(doctorData.priority),
                    callbackRec: this.toNullableString(doctorData.callbackRec),
                    urgency: this.toNullableString(doctorData.urgency),
                }
            });

            // PATIENT SAVING LOGIC — link/create patient even when call has no organization
            const patientName = this.toNullableString(summaryData.patientName);
            if (patientName) {
                const call = await this.prisma.call.findUnique({ where: { id: callId } });
                if (call) {
                    const names = patientName.trim().split(/\s+/);
                    const firstName = names[0];
                    const lastName = names.slice(1).join(' ') || '';
                    const phone = this.toNullableString(summaryData.phone) || call.phoneNumber || 'Unknown';
                    const orgId = call.organizationId;

                    let patient = await this.prisma.patient.findFirst({
                        where: {
                            phone,
                            ...(orgId
                                ? { organizationId: orgId }
                                : { organizationId: null }),
                        },
                    });

                    if (!patient) {
                        patient = await this.prisma.patient.create({
                            data: {
                                firstName,
                                lastName,
                                phone,
                                organizationId: orgId ?? undefined,
                            },
                        });
                    } else if (patient.firstName === 'Unknown' || !patient.lastName) {
                        patient = await this.prisma.patient.update({
                            where: { id: patient.id },
                            data: { firstName, lastName },
                        });
                    }

                    await this.prisma.call.update({
                        where: { id: callId },
                        data: {
                            patientId: patient.id,
                            patientName,
                        },
                    });
                }
            }

            return summary;
        } catch (error) {
            this.logger.error('Failed to generate summary', error);
            // Don't throw so the 500 error doesn't break the frontend completely
            return null;
        }
    }

    /** Prisma summary fields are strings; models often return arrays for symptoms/etc. */
    private toNullableString(value: unknown): string | null {
        if (value == null || value === '') return null;
        if (Array.isArray(value)) {
            const joined = value.map((v) => String(v).trim()).filter(Boolean).join(', ');
            return joined || null;
        }
        const str = String(value).trim();
        if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
            return null;
        }
        return str;
    }
}

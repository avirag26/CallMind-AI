import { PrismaService } from '../database/prisma.service';
import { OpenAIProvider } from './providers/openai.provider';
export declare class AiService {
    private readonly prisma;
    private readonly aiProvider;
    private readonly logger;
    constructor(prisma: PrismaService, aiProvider: OpenAIProvider);
    onModuleInit(): Promise<void>;
    getConversation(callId: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            model: string | null;
            text: string;
            provider: string | null;
            speaker: string;
            extractedState: import("@prisma/client/runtime/client").JsonValue | null;
            intent: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        callId: string;
    }>;
    initializeConversation(callId: string): Promise<{
        id: string;
        createdAt: Date;
        callId: string;
    }>;
    getSummary(callId: string): Promise<{
        id: string;
        createdAt: Date;
        phone: string | null;
        patientName: string | null;
        duration: string | null;
        conversationId: string;
        age: string | null;
        gender: string | null;
        concern: string | null;
        symptoms: string | null;
        urgency: string | null;
        preferredCallback: string | null;
        additionalNotes: string | null;
        shortSummary: string | null;
    } | null>;
    processMessage(callId: string, text: string): Promise<AsyncGenerator<import("./interfaces/ai-provider.interface").StreamChunk, import("./interfaces/ai-provider.interface").AIResponse, unknown>>;
    saveAiMessage(callId: string, text: string, usage: any, model: string, provider: string): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        model: string | null;
        text: string;
        provider: string | null;
        speaker: string;
        extractedState: import("@prisma/client/runtime/client").JsonValue | null;
        intent: string | null;
    }>;
    private buildConversationContext;
    generateSummary(callId: string): Promise<{
        id: string;
        createdAt: Date;
        phone: string | null;
        patientName: string | null;
        duration: string | null;
        conversationId: string;
        age: string | null;
        gender: string | null;
        concern: string | null;
        symptoms: string | null;
        urgency: string | null;
        preferredCallback: string | null;
        additionalNotes: string | null;
        shortSummary: string | null;
    } | null>;
    private toNullableString;
}

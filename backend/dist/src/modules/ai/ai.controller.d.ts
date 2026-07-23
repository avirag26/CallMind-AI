import { AiService } from './ai.service';
import { SendMessageDto } from './dto/ai.dto';
import type { Response } from 'express';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    getConversation(id: string): Promise<{
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
    getSummary(id: string): Promise<{
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
    endConversation(id: string): Promise<{
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
    processMessage(id: string, dto: SendMessageDto, res: Response): Promise<void>;
}

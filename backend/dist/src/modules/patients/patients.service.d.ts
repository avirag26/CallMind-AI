import { PrismaService } from '../database/prisma.service';
export declare class PatientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        latestSummary: {
            shortSummary: string | null;
            concern: string | null;
            symptoms: string | null;
            urgency: string | null;
        } | null;
        _count: {
            calls: number;
        };
        id: string;
        email: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string;
    }[]>;
    findOne(id: string): Promise<{
        calls: ({
            conversations: ({
                summaries: {
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
                }[];
            } & {
                id: string;
                createdAt: Date;
                callId: string;
            })[];
        } & {
            id: string;
            organizationId: string | null;
            createdAt: Date;
            updatedAt: Date;
            sid: string | null;
            status: import("@prisma/client").$Enums.CallStatus;
            phoneNumber: string | null;
            patientName: string | null;
            duration: number | null;
            startedAt: Date | null;
            timeoutAt: Date | null;
            patientId: string | null;
            doctorId: string | null;
        })[];
    } & {
        id: string;
        email: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        phone: string;
    }>;
}

import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../database/prisma.service';
import { OpenAIProvider } from './providers/openai.provider';

describe('AI Intelligence Engine', () => {
    let service: AiService;
    let prismaService: any;
    let aiProvider: any;

    beforeEach(async () => {
        prismaService = {
            conversation: {
                findFirst: jest.fn(),
                create: jest.fn(),
            },
            conversationMessage: {
                findMany: jest.fn(),
                create: jest.fn(),
            },
            promptTemplate: {
                findFirst: jest.fn(),
            }
        };

        aiProvider = {
            generateJSONResponse: jest.fn(),
            generateStream: jest.fn(),
            generateResponse: jest.fn(),
            initialize: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                { provide: PrismaService, useValue: prismaService },
                { provide: OpenAIProvider, useValue: aiProvider },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
    });

    it('should extract state and intent, and skip known info for a normal patient', async () => {
        prismaService.conversation.findFirst.mockResolvedValue({ id: 'conv-1', callId: 'call-1' });
        prismaService.conversationMessage.findMany.mockResolvedValue([]);
        prismaService.promptTemplate.findFirst.mockResolvedValue({ content: 'System Prompt' });
        
        aiProvider.generateJSONResponse.mockResolvedValue({
            text: JSON.stringify({ name: 'Rahul', concern: 'Fever', intent: 'General Inquiry' })
        });
        
        await service.processMessage('call-1', "Hi, I'm Rahul and I have a fever.");

        expect(aiProvider.generateJSONResponse).toHaveBeenCalled();
        expect(prismaService.conversationMessage.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    extractedState: { name: 'Rahul', concern: 'Fever' },
                    intent: 'General Inquiry'
                })
            })
        );
        expect(aiProvider.generateStream).toHaveBeenCalled();
    });

    it('should detect emergency intent and route accordingly', async () => {
        prismaService.conversation.findFirst.mockResolvedValue({ id: 'conv-2', callId: 'call-2' });
        prismaService.conversationMessage.findMany.mockResolvedValue([]);
        prismaService.promptTemplate.findFirst.mockResolvedValue({ content: 'System Prompt' });
        
        aiProvider.generateJSONResponse.mockResolvedValue({
            text: JSON.stringify({ name: 'Rahul', concern: 'Chest Pain', intent: 'Emergency' })
        });
        
        await service.processMessage('call-2', "I am having severe chest pain.");

        expect(prismaService.conversationMessage.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ intent: 'Emergency' })
            })
        );
        
        // Ensure the injected prompt contains the critical emergency rule
        const callArgs = aiProvider.generateStream.mock.calls[0][0];
        const systemPrompt = callArgs.find((msg: any) => msg.role === 'system').content;
        expect(systemPrompt).toContain('CRITICAL RULE');
        expect(systemPrompt).toContain('immediate emergency medical attention');
    });

    it('should generate nested JSON reports correctly in generateSummary', async () => {
        prismaService.conversation.findFirst.mockResolvedValue({ id: 'conv-3', callId: 'call-3' });
        prismaService.conversationMessage.findMany.mockResolvedValue([
            { speaker: 'USER', text: 'Hi' }
        ]);
        
        aiProvider.generateJSONResponse.mockResolvedValue({
            text: JSON.stringify({
                summary: { patientName: 'John', urgency: 'High' },
                qualityScore: { quality: 'Good', missingInfo: 'None' },
                doctorReport: { priority: 'Urgent', callbackRec: 'ASAP' }
            })
        });

        prismaService.conversationSummary = { create: jest.fn() };
        prismaService.qualityScore = { create: jest.fn() };
        prismaService.doctorReport = { create: jest.fn() };
        prismaService.patient = { findFirst: jest.fn() };
        
        await service.generateSummary('call-3');

        expect(prismaService.conversationSummary.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ patientName: 'John' }) })
        );
        expect(prismaService.qualityScore.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ quality: 'Good' }) })
        );
        expect(prismaService.doctorReport.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ priority: 'Urgent' }) })
        );
    });
});

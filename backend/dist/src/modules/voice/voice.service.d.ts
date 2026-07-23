import { KokoroTtsProvider } from './providers/kokoro-tts.provider';
import { AiService } from '../ai/ai.service';
import { CallsService } from '../calls/calls.service';
import { ITransportAdapter } from './interfaces/transport-adapter.interface';
export declare class VoiceOrchestratorService {
    private readonly aiService;
    private readonly callsService;
    private readonly ttsProvider;
    private readonly logger;
    private activeSessions;
    constructor(aiService: AiService, callsService: CallsService, ttsProvider: KokoroTtsProvider);
    attachTransport(callId: string, transport: ITransportAdapter): Promise<void>;
    endSession(callId: string): void;
}

import { KokoroTtsProvider } from './providers/kokoro-tts.provider';
import { AiService } from '../ai/ai.service';
import { CallsService } from '../calls/calls.service';
export declare class VoiceService {
    private readonly aiService;
    private readonly callsService;
    private readonly ttsProvider;
    private readonly logger;
    private activeSessions;
    constructor(aiService: AiService, callsService: CallsService, ttsProvider: KokoroTtsProvider);
    startSession(callId: string, emitAudio: (audio: Buffer) => void, emitState: (state: any) => void): Promise<void>;
    handleAudioChunk(callId: string, chunk: Buffer): void;
    endSession(callId: string): void;
}

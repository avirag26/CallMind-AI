import { ITextToSpeechProvider } from '../interfaces/voice-provider.interface';
export declare class KokoroTtsProvider implements ITextToSpeechProvider {
    private readonly logger;
    private replicate;
    constructor();
    generateSpeech(text: string): Promise<Buffer>;
}

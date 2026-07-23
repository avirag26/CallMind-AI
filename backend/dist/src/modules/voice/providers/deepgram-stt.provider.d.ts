import { ISpeechToTextProvider } from '../interfaces/voice-provider.interface';
export declare class DeepgramSttProvider implements ISpeechToTextProvider {
    private readonly logger;
    private deepgramClient;
    private partialCallback?;
    private finalCallback?;
    private errorCallback?;
    connect(): Promise<void>;
    disconnect(): void;
    sendAudio(chunk: Buffer | Int16Array): void;
    onPartialTranscript(callback: (text: string) => void): void;
    onFinalTranscript(callback: (text: string) => void): void;
    onError(callback: (error: any) => void): void;
}

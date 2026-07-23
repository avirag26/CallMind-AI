export interface ITransportAdapter {
    onAudioReceive(callback: (audio: Buffer) => void): void;
    onEndSession(callback: () => void): void;
    playAudio(audio: Buffer): void;
    interrupt(partialText?: string): void;
    sendState(state: any): void;
}

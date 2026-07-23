import { Socket } from 'socket.io';
import { ITransportAdapter } from '../interfaces/transport-adapter.interface';
export declare class BrowserTransportAdapter implements ITransportAdapter {
    private readonly client;
    private audioReceiveCallback?;
    private endSessionCallback?;
    constructor(client: Socket);
    pushAudio(chunk: Buffer): void;
    pushEndSession(): void;
    onAudioReceive(callback: (audio: Buffer) => void): void;
    onEndSession(callback: () => void): void;
    playAudio(audio: Buffer): void;
    interrupt(partialText?: string): void;
    sendState(state: any): void;
}

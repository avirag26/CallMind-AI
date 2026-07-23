import { Socket } from 'socket.io';
import { ITransportAdapter } from '../interfaces/transport-adapter.interface';

export class BrowserTransportAdapter implements ITransportAdapter {
  private audioReceiveCallback?: (audio: Buffer) => void;
  private endSessionCallback?: () => void;

  constructor(private readonly client: Socket) {}

  // Methods for VoiceGateway to forward events into the adapter
  pushAudio(chunk: Buffer) {
    if (this.audioReceiveCallback) {
      this.audioReceiveCallback(chunk);
    }
  }

  pushEndSession() {
    if (this.endSessionCallback) {
      this.endSessionCallback();
    }
  }

  onAudioReceive(callback: (audio: Buffer) => void): void {
    this.audioReceiveCallback = callback;
  }

  onEndSession(callback: () => void): void {
    this.endSessionCallback = callback;
  }

  playAudio(audio: Buffer): void {
    this.client.emit('audio-chunk', audio);
  }

  interrupt(partialText?: string): void {
    this.client.emit('voice-state', { status: 'Interrupted', partial: partialText });
  }

  sendState(state: any): void {
    this.client.emit('voice-state', state);
  }
}

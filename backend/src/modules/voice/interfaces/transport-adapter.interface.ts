export interface ITransportAdapter {
  // Callbacks for Orchestrator to listen to
  onAudioReceive(callback: (audio: Buffer) => void): void;
  onEndSession(callback: () => void): void;
  
  // Commands for Orchestrator to execute
  playAudio(audio: Buffer): void;
  interrupt(partialText?: string): void;
  sendState(state: any): void;
}

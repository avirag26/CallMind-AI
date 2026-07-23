export interface ISpeechToTextProvider {
  connect(): Promise<void>;
  disconnect(): void;
  sendAudio(chunk: Buffer | Int16Array): void;
  onPartialTranscript(callback: (text: string) => void): void;
  onFinalTranscript(callback: (text: string) => void): void;
  onError(callback: (error: any) => void): void;
}

export interface ITextToSpeechProvider {
  generateSpeech(text: string): Promise<Buffer>;
}

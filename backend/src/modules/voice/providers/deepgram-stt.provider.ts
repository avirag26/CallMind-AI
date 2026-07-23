import { Injectable, Logger } from '@nestjs/common';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { ISpeechToTextProvider } from '../interfaces/voice-provider.interface';

@Injectable()
export class DeepgramSttProvider implements ISpeechToTextProvider {
  private readonly logger = new Logger(DeepgramSttProvider.name);
  private deepgramClient: LiveClient | null = null;
  
  private partialCallback?: (text: string) => void;
  private finalCallback?: (text: string) => void;
  private errorCallback?: (error: any) => void;

  async connect(): Promise<void> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      this.logger.error('DEEPGRAM_API_KEY is not defined in .env');
      throw new Error('DEEPGRAM_API_KEY is missing');
    }

    const deepgram = createClient(apiKey);
    
    // Configure Deepgram for low-latency conversational AI
    this.deepgramClient = deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      encoding: 'linear16',
      sample_rate: 16000,
      channels: 1,
      interim_results: true,
      endpointing: 300, // Detect silence to finalize turn
      utterance_end_ms: 1000,
    });

    return new Promise((resolve, reject) => {
      if (!this.deepgramClient) return reject(new Error('Deepgram client not created'));

      this.deepgramClient.on(LiveTranscriptionEvents.Open, () => {
        this.logger.log('Deepgram WebSocket connected');
        resolve();
      });

      this.deepgramClient.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (!transcript) return;
        
        if (data.is_final) {
          if (this.finalCallback) this.finalCallback(transcript);
        } else {
          if (this.partialCallback) this.partialCallback(transcript);
        }
      });

      this.deepgramClient.on(LiveTranscriptionEvents.Error, (err) => {
        this.logger.error('Deepgram Error', err);
        if (this.errorCallback) this.errorCallback(err);
      });

      this.deepgramClient.on(LiveTranscriptionEvents.Close, () => {
        this.logger.log('Deepgram WebSocket disconnected');
      });
    });
  }

  disconnect(): void {
    if (this.deepgramClient) {
      this.deepgramClient.requestClose();
      this.deepgramClient = null;
    }
  }

  sendAudio(chunk: Buffer | Int16Array): void {
    if (this.deepgramClient && this.deepgramClient.getReadyState() === 1 /* OPEN */) {
      this.deepgramClient.send(chunk as any);
    }
  }

  onPartialTranscript(callback: (text: string) => void): void {
    this.partialCallback = callback;
  }

  onFinalTranscript(callback: (text: string) => void): void {
    this.finalCallback = callback;
  }

  onError(callback: (error: any) => void): void {
    this.errorCallback = callback;
  }
}

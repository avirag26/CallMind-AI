import { Injectable, Logger } from '@nestjs/common';
import Replicate from 'replicate';
import { ITextToSpeechProvider } from '../interfaces/voice-provider.interface';

@Injectable()
export class KokoroTtsProvider implements ITextToSpeechProvider {
  private readonly logger = new Logger(KokoroTtsProvider.name);
  private replicate: Replicate;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || '',
    });
  }

  async generateSpeech(text: string): Promise<Buffer> {
    if (!process.env.REPLICATE_API_TOKEN) {
      this.logger.warn('REPLICATE_API_TOKEN missing, cannot generate speech');
      throw new Error('REPLICATE_API_TOKEN missing');
    }

    this.logger.log(`Generating TTS for: "${text.substring(0, 50)}..."`);

    try {
      // Using a known Kokoro TTS model on Replicate
      // You can update this model version in the future if hexgrad publishes an official one
      const output: any = await this.replicate.run(
        "lucataco/kokoro:cbdd5e717849dbb050fbd1ceef0baeb89e6eb5c7f8f902636edfb9ce8c9cb6b6",
        {
          input: {
            text: text,
            voice: "af", // default english female voice
            speed: 1,
          }
        }
      );

      // output is usually a string URL pointing to the generated audio (e.g., mp3 or wav)
      const audioUrl = Array.isArray(output) ? output[0] : output;
      
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio from Replicate URL: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error('Failed to generate speech with Kokoro (Replicate)', error);
      throw error;
    }
  }
}

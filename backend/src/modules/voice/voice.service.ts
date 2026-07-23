import { Injectable, Logger } from '@nestjs/common';
import { DeepgramSttProvider } from './providers/deepgram-stt.provider';
import { KokoroTtsProvider } from './providers/kokoro-tts.provider';
import { AiService } from '../ai/ai.service';
import { CallsService } from '../calls/calls.service';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  // Map of Call ID to STT providers
  private activeSessions = new Map<string, {
    stt: DeepgramSttProvider,
    isAiSpeaking: boolean
  }>();

  constructor(
    private readonly aiService: AiService,
    private readonly callsService: CallsService,
    private readonly ttsProvider: KokoroTtsProvider,
  ) {}

  async startSession(callId: string, emitAudio: (audio: Buffer) => void, emitState: (state: any) => void) {
    this.logger.log(`Starting voice session for call ${callId}`);

    const stt = new DeepgramSttProvider();
    await stt.connect();

    this.activeSessions.set(callId, { stt, isAiSpeaking: false });

    emitState({ status: 'Listening' });

    stt.onPartialTranscript((text) => {
      // Barge-in logic: if partial transcript is received while AI is speaking, interrupt it
      const session = this.activeSessions.get(callId);
      if (session && session.isAiSpeaking) {
        session.isAiSpeaking = false;
        emitState({ status: 'Interrupted', partial: text });
      } else {
        emitState({ partial: text });
      }
    });

    stt.onFinalTranscript(async (text) => {
      const session = this.activeSessions.get(callId);
      if (session) session.isAiSpeaking = false;

      emitState({ final: text, status: 'Thinking' });

      try {
        const stream = await this.aiService.processMessage(callId, text);
        let fullText = '';
        for await (const chunk of stream) {
          if (chunk.content) fullText += chunk.content;
        }

        // Get the latest extracted JSON state
        const conversation = await this.aiService.getConversation(callId);
        const lastMsg = conversation.messages[conversation.messages.length - 1];

        emitState({ 
          aiResponse: fullText, 
          status: 'Speaking',
          patientState: lastMsg?.extractedState || null
        });

        // Trigger TTS
        if (session) session.isAiSpeaking = true;
        const audioBuffer = await this.ttsProvider.generateSpeech(fullText);
        
        // If they haven't interrupted while we were generating TTS
        if (session && session.isAiSpeaking) {
          emitAudio(audioBuffer);
        }

        // Reset to listening after audio is sent
        emitState({ status: 'Listening' });
        if (session) session.isAiSpeaking = false;

      } catch (error: any) {
        this.logger.error('Error processing voice message', error);
        emitState({ status: 'Error', error: error.message });
      }
    });
  }

  handleAudioChunk(callId: string, chunk: Buffer) {
    const session = this.activeSessions.get(callId);
    if (session) {
      session.stt.sendAudio(chunk);
    }
  }

  endSession(callId: string) {
    const session = this.activeSessions.get(callId);
    if (session) {
      session.stt.disconnect();
      this.activeSessions.delete(callId);
    }
    this.logger.log(`Ended voice session for call ${callId}`);
  }
}

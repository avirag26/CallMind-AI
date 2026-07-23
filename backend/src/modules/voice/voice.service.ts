import { Injectable, Logger } from '@nestjs/common';
import { DeepgramSttProvider } from './providers/deepgram-stt.provider';
import { KokoroTtsProvider } from './providers/kokoro-tts.provider';
import { AiService } from '../ai/ai.service';
import { CallsService } from '../calls/calls.service';
import { ITransportAdapter } from './interfaces/transport-adapter.interface';

@Injectable()
export class VoiceOrchestratorService {
  private readonly logger = new Logger(VoiceOrchestratorService.name);

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

  async attachTransport(callId: string, transport: ITransportAdapter) {
    this.logger.log(`Attaching transport for voice session ${callId}`);

    const stt = new DeepgramSttProvider();
    await stt.connect();

    this.activeSessions.set(callId, { stt, isAiSpeaking: false });

    try {
      await this.aiService.initializeConversation(callId);
    } catch (err) {
      this.logger.error('Failed to initialize conversation', err);
    }

    const session = this.activeSessions.get(callId);
    if (session) session.isAiSpeaking = false;
    transport.sendState({ status: 'Listening' });

    // Handle incoming audio from transport
    transport.onAudioReceive((audioBuffer: Buffer) => {
      const session = this.activeSessions.get(callId);
      if (session) {
        session.stt.sendAudio(audioBuffer);
      }
    });

    // Handle end session from transport
    transport.onEndSession(() => {
      this.endSession(callId);
    });

    stt.onPartialTranscript((text) => {
      // Barge-in logic: if partial transcript is received while AI is speaking, interrupt it
      const session = this.activeSessions.get(callId);
      if (session && session.isAiSpeaking) {
        session.isAiSpeaking = false;
        transport.interrupt(text);
      } else {
        transport.sendState({ partial: text });
      }
    });

    stt.onFinalTranscript(async (text) => {
      const session = this.activeSessions.get(callId);
      if (session) session.isAiSpeaking = false;

      transport.sendState({ final: text, status: 'Thinking' });

      try {
        const stream = await this.aiService.processMessage(callId, text);
        let fullText = '';
        for await (const chunk of stream) {
          if (chunk.content) fullText += chunk.content;
        }

        // Get the latest extracted JSON state
        const conversation = await this.aiService.getConversation(callId);
        const lastMsg = conversation.messages[conversation.messages.length - 1];

        transport.sendState({ 
          aiResponse: fullText, 
          status: 'Speaking',
          patientState: lastMsg?.extractedState || null
        });

        // Trigger TTS
        if (session) session.isAiSpeaking = true;
        const audioBuffer = await this.ttsProvider.generateSpeech(fullText);
        
        // If they haven't interrupted while we were generating TTS
        if (session && session.isAiSpeaking) {
          transport.playAudio(audioBuffer);
        }

        // Reset to listening after audio is sent
        transport.sendState({ status: 'Listening' });
        if (session) session.isAiSpeaking = false;

      } catch (error: any) {
        this.logger.error('Error processing voice message', error);
        transport.sendState({ status: 'Error', error: error.message });
      }
    });
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

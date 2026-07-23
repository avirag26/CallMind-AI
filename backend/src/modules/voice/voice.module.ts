import { Module } from '@nestjs/common';
import { VoiceGateway } from './voice.gateway';
import { VoiceOrchestratorService } from './voice.service';
import { DeepgramSttProvider } from './providers/deepgram-stt.provider';
import { KokoroTtsProvider } from './providers/kokoro-tts.provider';
import { AiModule } from '../ai/ai.module';
import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [AiModule, CallsModule],
  providers: [VoiceGateway, VoiceOrchestratorService, DeepgramSttProvider, KokoroTtsProvider],
})
export class VoiceModule {}

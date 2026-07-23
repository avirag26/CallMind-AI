"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
const common_1 = require("@nestjs/common");
const deepgram_stt_provider_1 = require("./providers/deepgram-stt.provider");
const kokoro_tts_provider_1 = require("./providers/kokoro-tts.provider");
const ai_service_1 = require("../ai/ai.service");
const calls_service_1 = require("../calls/calls.service");
let VoiceService = VoiceService_1 = class VoiceService {
    aiService;
    callsService;
    ttsProvider;
    logger = new common_1.Logger(VoiceService_1.name);
    activeSessions = new Map();
    constructor(aiService, callsService, ttsProvider) {
        this.aiService = aiService;
        this.callsService = callsService;
        this.ttsProvider = ttsProvider;
    }
    async startSession(callId, emitAudio, emitState) {
        this.logger.log(`Starting voice session for call ${callId}`);
        const stt = new deepgram_stt_provider_1.DeepgramSttProvider();
        await stt.connect();
        this.activeSessions.set(callId, { stt, isAiSpeaking: false });
        emitState({ status: 'Listening' });
        stt.onPartialTranscript((text) => {
            const session = this.activeSessions.get(callId);
            if (session && session.isAiSpeaking) {
                session.isAiSpeaking = false;
                emitState({ status: 'Interrupted', partial: text });
            }
            else {
                emitState({ partial: text });
            }
        });
        stt.onFinalTranscript(async (text) => {
            const session = this.activeSessions.get(callId);
            if (session)
                session.isAiSpeaking = false;
            emitState({ final: text, status: 'Thinking' });
            try {
                const stream = await this.aiService.processMessage(callId, text);
                let fullText = '';
                for await (const chunk of stream) {
                    if (chunk.content)
                        fullText += chunk.content;
                }
                const conversation = await this.aiService.getConversation(callId);
                const lastMsg = conversation.messages[conversation.messages.length - 1];
                emitState({
                    aiResponse: fullText,
                    status: 'Speaking',
                    patientState: lastMsg?.extractedState || null
                });
                if (session)
                    session.isAiSpeaking = true;
                const audioBuffer = await this.ttsProvider.generateSpeech(fullText);
                if (session && session.isAiSpeaking) {
                    emitAudio(audioBuffer);
                }
                emitState({ status: 'Listening' });
                if (session)
                    session.isAiSpeaking = false;
            }
            catch (error) {
                this.logger.error('Error processing voice message', error);
                emitState({ status: 'Error', error: error.message });
            }
        });
    }
    handleAudioChunk(callId, chunk) {
        const session = this.activeSessions.get(callId);
        if (session) {
            session.stt.sendAudio(chunk);
        }
    }
    endSession(callId) {
        const session = this.activeSessions.get(callId);
        if (session) {
            session.stt.disconnect();
            this.activeSessions.delete(callId);
        }
        this.logger.log(`Ended voice session for call ${callId}`);
    }
};
exports.VoiceService = VoiceService;
exports.VoiceService = VoiceService = VoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        calls_service_1.CallsService,
        kokoro_tts_provider_1.KokoroTtsProvider])
], VoiceService);
//# sourceMappingURL=voice.service.js.map
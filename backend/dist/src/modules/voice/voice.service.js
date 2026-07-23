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
var VoiceOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const deepgram_stt_provider_1 = require("./providers/deepgram-stt.provider");
const kokoro_tts_provider_1 = require("./providers/kokoro-tts.provider");
const ai_service_1 = require("../ai/ai.service");
const calls_service_1 = require("../calls/calls.service");
let VoiceOrchestratorService = VoiceOrchestratorService_1 = class VoiceOrchestratorService {
    aiService;
    callsService;
    ttsProvider;
    logger = new common_1.Logger(VoiceOrchestratorService_1.name);
    activeSessions = new Map();
    constructor(aiService, callsService, ttsProvider) {
        this.aiService = aiService;
        this.callsService = callsService;
        this.ttsProvider = ttsProvider;
    }
    async attachTransport(callId, transport) {
        this.logger.log(`Attaching transport for voice session ${callId}`);
        const stt = new deepgram_stt_provider_1.DeepgramSttProvider();
        await stt.connect();
        this.activeSessions.set(callId, { stt, isAiSpeaking: false });
        try {
            await this.aiService.initializeConversation(callId);
            const conversation = await this.aiService.getConversation(callId);
            const initialGreeting = conversation?.messages?.find(m => m.speaker === 'system' || m.speaker === 'assistant');
            if (initialGreeting && initialGreeting.text) {
                transport.sendState({ status: 'Speaking', aiResponse: initialGreeting.text });
                const session = this.activeSessions.get(callId);
                if (session)
                    session.isAiSpeaking = true;
                const audioBuffer = await this.ttsProvider.generateSpeech(initialGreeting.text);
                if (session && session.isAiSpeaking) {
                    transport.playAudio(audioBuffer);
                }
            }
        }
        catch (err) {
            this.logger.error('Failed to speak initial greeting', err);
        }
        const session = this.activeSessions.get(callId);
        if (session)
            session.isAiSpeaking = false;
        transport.sendState({ status: 'Listening' });
        transport.onAudioReceive((audioBuffer) => {
            const session = this.activeSessions.get(callId);
            if (session) {
                session.stt.sendAudio(audioBuffer);
            }
        });
        transport.onEndSession(() => {
            this.endSession(callId);
        });
        stt.onPartialTranscript((text) => {
            const session = this.activeSessions.get(callId);
            if (session && session.isAiSpeaking) {
                session.isAiSpeaking = false;
                transport.interrupt(text);
            }
            else {
                transport.sendState({ partial: text });
            }
        });
        stt.onFinalTranscript(async (text) => {
            const session = this.activeSessions.get(callId);
            if (session)
                session.isAiSpeaking = false;
            transport.sendState({ final: text, status: 'Thinking' });
            try {
                const stream = await this.aiService.processMessage(callId, text);
                let fullText = '';
                for await (const chunk of stream) {
                    if (chunk.content)
                        fullText += chunk.content;
                }
                const conversation = await this.aiService.getConversation(callId);
                const lastMsg = conversation.messages[conversation.messages.length - 1];
                transport.sendState({
                    aiResponse: fullText,
                    status: 'Speaking',
                    patientState: lastMsg?.extractedState || null
                });
                if (session)
                    session.isAiSpeaking = true;
                const audioBuffer = await this.ttsProvider.generateSpeech(fullText);
                if (session && session.isAiSpeaking) {
                    transport.playAudio(audioBuffer);
                }
                transport.sendState({ status: 'Listening' });
                if (session)
                    session.isAiSpeaking = false;
            }
            catch (error) {
                this.logger.error('Error processing voice message', error);
                transport.sendState({ status: 'Error', error: error.message });
            }
        });
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
exports.VoiceOrchestratorService = VoiceOrchestratorService;
exports.VoiceOrchestratorService = VoiceOrchestratorService = VoiceOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        calls_service_1.CallsService,
        kokoro_tts_provider_1.KokoroTtsProvider])
], VoiceOrchestratorService);
//# sourceMappingURL=voice.service.js.map
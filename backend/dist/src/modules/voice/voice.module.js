"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceModule = void 0;
const common_1 = require("@nestjs/common");
const voice_gateway_1 = require("./voice.gateway");
const voice_service_1 = require("./voice.service");
const deepgram_stt_provider_1 = require("./providers/deepgram-stt.provider");
const kokoro_tts_provider_1 = require("./providers/kokoro-tts.provider");
const ai_module_1 = require("../ai/ai.module");
const calls_module_1 = require("../calls/calls.module");
let VoiceModule = class VoiceModule {
};
exports.VoiceModule = VoiceModule;
exports.VoiceModule = VoiceModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_module_1.AiModule, calls_module_1.CallsModule],
        providers: [voice_gateway_1.VoiceGateway, voice_service_1.VoiceOrchestratorService, deepgram_stt_provider_1.DeepgramSttProvider, kokoro_tts_provider_1.KokoroTtsProvider],
    })
], VoiceModule);
//# sourceMappingURL=voice.module.js.map
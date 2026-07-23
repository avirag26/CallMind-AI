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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var KokoroTtsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KokoroTtsProvider = void 0;
const common_1 = require("@nestjs/common");
const replicate_1 = __importDefault(require("replicate"));
let KokoroTtsProvider = KokoroTtsProvider_1 = class KokoroTtsProvider {
    logger = new common_1.Logger(KokoroTtsProvider_1.name);
    replicate;
    constructor() {
        this.replicate = new replicate_1.default({
            auth: process.env.REPLICATE_API_TOKEN || '',
        });
    }
    async generateSpeech(text) {
        if (!process.env.REPLICATE_API_TOKEN) {
            this.logger.warn('REPLICATE_API_TOKEN missing, cannot generate speech');
            throw new Error('REPLICATE_API_TOKEN missing');
        }
        this.logger.log(`Generating TTS for: "${text.substring(0, 50)}..."`);
        try {
            const output = await this.replicate.run("lucataco/kokoro:cbdd5e717849dbb050fbd1ceef0baeb89e6eb5c7f8f902636edfb9ce8c9cb6b6", {
                input: {
                    text: text,
                    voice: "af",
                    speed: 1,
                }
            });
            const audioUrl = Array.isArray(output) ? output[0] : output;
            const response = await fetch(audioUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio from Replicate URL: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }
        catch (error) {
            this.logger.error('Failed to generate speech with Kokoro (Replicate)', error);
            throw error;
        }
    }
};
exports.KokoroTtsProvider = KokoroTtsProvider;
exports.KokoroTtsProvider = KokoroTtsProvider = KokoroTtsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KokoroTtsProvider);
//# sourceMappingURL=kokoro-tts.provider.js.map
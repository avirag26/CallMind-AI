"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenAIProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const common_1 = require("@nestjs/common");
let OpenAIProvider = OpenAIProvider_1 = class OpenAIProvider {
    openai;
    logger = new common_1.Logger(OpenAIProvider_1.name);
    defaultModel = process.env.AI_MODEL || 'gpt-4o-mini';
    initialize() {
        if (!process.env.OPENAI_API_KEY) {
            this.logger.warn('OPENAI_API_KEY is not set. AI provider will fail if called.');
        }
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY',
            baseURL: process.env.OPENAI_BASE_URL || undefined,
        });
    }
    getProviderName() {
        return 'OpenAI';
    }
    async generateResponse(messages) {
        const response = await this.openai.chat.completions.create({
            model: this.defaultModel,
            messages,
            temperature: 0.7,
        });
        return {
            text: response.choices[0]?.message?.content || '',
            usage: response.usage ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
            } : undefined,
            model: this.defaultModel,
            provider: this.getProviderName(),
        };
    }
    async generateJSONResponse(messages) {
        const response = await this.openai.chat.completions.create({
            model: this.defaultModel,
            messages,
            temperature: 0.1,
            response_format: { type: 'json_object' },
        });
        return {
            text: response.choices[0]?.message?.content || '{}',
            usage: response.usage ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
            } : undefined,
            model: this.defaultModel,
            provider: this.getProviderName(),
        };
    }
    async *generateStream(messages) {
        const stream = await this.openai.chat.completions.create({
            model: this.defaultModel,
            messages,
            temperature: 0.7,
            stream: true,
            stream_options: { include_usage: true },
        });
        let fullText = '';
        let finalUsage = undefined;
        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                const text = chunk.choices[0].delta.content;
                fullText += text;
                yield { content: text };
            }
            if (chunk.usage) {
                finalUsage = {
                    promptTokens: chunk.usage.prompt_tokens,
                    completionTokens: chunk.usage.completion_tokens,
                    totalTokens: chunk.usage.total_tokens,
                };
            }
        }
        return {
            text: fullText,
            usage: finalUsage,
            model: this.defaultModel,
            provider: this.getProviderName(),
        };
    }
};
exports.OpenAIProvider = OpenAIProvider;
exports.OpenAIProvider = OpenAIProvider = OpenAIProvider_1 = __decorate([
    (0, common_1.Injectable)()
], OpenAIProvider);
//# sourceMappingURL=openai.provider.js.map
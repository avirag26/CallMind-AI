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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const ai_dto_1 = require("./dto/ai.dto");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async getConversation(id) {
        return this.aiService.getConversation(id);
    }
    async getSummary(id) {
        return this.aiService.getSummary(id);
    }
    async endConversation(id) {
        return this.aiService.generateSummary(id);
    }
    async processMessage(id, dto, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        try {
            const stream = await this.aiService.processMessage(id, dto.text);
            let fullText = '';
            let finalUsage = undefined;
            let finalModel = '';
            let finalProvider = '';
            for await (const chunk of stream) {
                if (chunk.content) {
                    fullText += chunk.content;
                    res.write(`data: ${JSON.stringify({ text: chunk.content })}\n\n`);
                }
                if (chunk.usage || chunk.provider) {
                    const result = chunk;
                    finalUsage = result.usage;
                    finalModel = result.model;
                    finalProvider = result.provider;
                }
            }
            if (fullText.length > 0) {
                const msg = await this.aiService.saveAiMessage(id, fullText, finalUsage, finalModel, finalProvider);
                res.write(`data: ${JSON.stringify({ done: true, messageId: msg.id })}\n\n`);
            }
            res.end();
        }
        catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Get)('conversation/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Get)('summary/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)('end/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "endConversation", null);
__decorate([
    (0, common_1.Post)('message/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ai_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "processMessage", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map
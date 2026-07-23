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
var VoiceGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const voice_service_1 = require("./voice.service");
const browser_transport_adapter_1 = require("./adapters/browser-transport.adapter");
let VoiceGateway = VoiceGateway_1 = class VoiceGateway {
    voiceOrchestrator;
    server;
    logger = new common_1.Logger(VoiceGateway_1.name);
    adapters = new Map();
    constructor(voiceOrchestrator) {
        this.voiceOrchestrator = voiceOrchestrator;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const adapter = this.adapters.get(client.id);
        if (adapter) {
            adapter.pushEndSession();
            this.adapters.delete(client.id);
        }
    }
    async handleStartSession(client, data) {
        const { callId } = data;
        const adapter = new browser_transport_adapter_1.BrowserTransportAdapter(client);
        this.adapters.set(client.id, adapter);
        await this.voiceOrchestrator.attachTransport(callId, adapter);
        return { success: true };
    }
    handleAudioStream(client, chunk) {
        const adapter = this.adapters.get(client.id);
        if (adapter) {
            adapter.pushAudio(chunk);
        }
    }
    handleEndSession(client) {
        const adapter = this.adapters.get(client.id);
        if (adapter) {
            adapter.pushEndSession();
            this.adapters.delete(client.id);
        }
    }
};
exports.VoiceGateway = VoiceGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], VoiceGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('start-session'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], VoiceGateway.prototype, "handleStartSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('audio-stream'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        Buffer]),
    __metadata("design:returntype", void 0)
], VoiceGateway.prototype, "handleAudioStream", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('end-session'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], VoiceGateway.prototype, "handleEndSession", null);
exports.VoiceGateway = VoiceGateway = VoiceGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/voice', cors: { origin: '*' } }),
    __metadata("design:paramtypes", [voice_service_1.VoiceOrchestratorService])
], VoiceGateway);
//# sourceMappingURL=voice.gateway.js.map
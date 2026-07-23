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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const calls_repository_1 = require("./repositories/calls.repository");
const client_1 = require("@prisma/client");
const events_gateway_1 = require("../events/events.gateway");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const pino_1 = __importDefault(require("pino"));
const ai_service_1 = require("../ai/ai.service");
const logger = (0, pino_1.default)();
let CallsService = class CallsService {
    callsRepository;
    eventsGateway;
    callTimeoutQueue;
    aiService;
    constructor(callsRepository, eventsGateway, callTimeoutQueue, aiService) {
        this.callsRepository = callsRepository;
        this.eventsGateway = eventsGateway;
        this.callTimeoutQueue = callTimeoutQueue;
        this.aiService = aiService;
    }
    async createMockCall(data) {
        const startedAt = new Date();
        const timeoutAt = new Date(startedAt.getTime() + 60000);
        const call = await this.callsRepository.createCall({
            phoneNumber: data.phoneNumber,
            patientName: data.patientName,
            status: client_1.CallStatus.RINGING,
            startedAt,
            timeoutAt,
        });
        logger.info({ callId: call.id }, 'Call Started');
        this.eventsGateway.broadcastCallCreated(call);
        await this.callTimeoutQueue.add('timeout', { callId: call.id }, { delay: 60000 });
        return call;
    }
    async answerCall(id) {
        const call = await this.callsRepository.findCallById(id);
        if (!call)
            throw new common_1.NotFoundException('Call not found');
        const updated = await this.callsRepository.updateCallStatus(id, client_1.CallStatus.ANSWERED);
        logger.info({ callId: id }, 'Doctor Answered');
        this.eventsGateway.broadcastCallUpdated(updated);
        return updated;
    }
    async rejectCall(id) {
        const call = await this.callsRepository.findCallById(id);
        if (!call)
            throw new common_1.NotFoundException('Call not found');
        const updated = await this.callsRepository.updateCallStatus(id, client_1.CallStatus.REJECTED);
        logger.info({ callId: id }, 'Doctor Rejected');
        this.eventsGateway.broadcastCallUpdated(updated);
        await this.startAiSession(id);
        return updated;
    }
    async endCall(id) {
        const call = await this.callsRepository.findCallById(id);
        if (!call)
            throw new common_1.NotFoundException('Call not found');
        const updated = await this.callsRepository.updateCallStatus(id, client_1.CallStatus.COMPLETED);
        logger.info({ callId: id }, 'Call Ended');
        this.eventsGateway.broadcastCallEnded(updated);
        return updated;
    }
    async handleCallTimeout(id) {
        const call = await this.callsRepository.findCallById(id);
        if (call && call.status === client_1.CallStatus.RINGING) {
            const updated = await this.callsRepository.updateCallStatus(id, client_1.CallStatus.MISSED);
            logger.info({ callId: id }, 'Timeout');
            this.eventsGateway.broadcastCallUpdated(updated);
            await this.startAiSession(id);
        }
    }
    async startAiSession(id) {
        const updated = await this.callsRepository.updateCallStatus(id, client_1.CallStatus.AI_ACTIVE);
        logger.info({ callId: id }, 'AI Started');
        const conversation = await this.aiService.initializeConversation(id);
        this.eventsGateway.broadcastAiStarted(updated);
        return updated;
    }
    async getCall(id) {
        return this.callsRepository.findCallById(id);
    }
    async getActiveCalls() {
        return this.callsRepository.getActiveCalls();
    }
    async getCallHistory() {
        return this.callsRepository.getCallHistory();
    }
};
exports.CallsService = CallsService;
exports.CallsService = CallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('call-timeout')),
    __metadata("design:paramtypes", [calls_repository_1.CallsRepository,
        events_gateway_1.EventsGateway,
        bullmq_2.Queue,
        ai_service_1.AiService])
], CallsService);
//# sourceMappingURL=calls.service.js.map
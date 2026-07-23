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
exports.CallTimeoutProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const calls_service_1 = require("../calls/calls.service");
let CallTimeoutProcessor = class CallTimeoutProcessor extends bullmq_1.WorkerHost {
    callsService;
    constructor(callsService) {
        super();
        this.callsService = callsService;
    }
    async process(job) {
        const { callId } = job.data;
        console.log(`Processing call timeout for callId: ${callId}`);
        await this.callsService.handleCallTimeout(callId);
    }
};
exports.CallTimeoutProcessor = CallTimeoutProcessor;
exports.CallTimeoutProcessor = CallTimeoutProcessor = __decorate([
    (0, bullmq_1.Processor)('call-timeout'),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => calls_service_1.CallsService))),
    __metadata("design:paramtypes", [calls_service_1.CallsService])
], CallTimeoutProcessor);
//# sourceMappingURL=call-timeout.processor.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let CallsRepository = class CallsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCall(data) {
        return this.prisma.call.create({
            data,
        });
    }
    async findCallById(id) {
        return this.prisma.call.findUnique({
            where: { id },
        });
    }
    async updateCallStatus(id, status) {
        return this.prisma.call.update({
            where: { id },
            data: { status },
        });
    }
    async getActiveCalls() {
        return this.prisma.call.findMany({
            where: {
                status: { in: [client_1.CallStatus.RINGING, client_1.CallStatus.ANSWERED, client_1.CallStatus.AI_ACTIVE] },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCallHistory() {
        return this.prisma.call.findMany({
            where: {
                status: { in: [client_1.CallStatus.COMPLETED, client_1.CallStatus.MISSED, client_1.CallStatus.REJECTED, client_1.CallStatus.FAILED] },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.CallsRepository = CallsRepository;
exports.CallsRepository = CallsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CallsRepository);
//# sourceMappingURL=calls.repository.js.map
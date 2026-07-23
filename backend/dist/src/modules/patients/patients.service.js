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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let PatientsService = class PatientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const patients = await this.prisma.patient.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { calls: true },
                },
                calls: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        conversations: {
                            take: 1,
                            include: {
                                summaries: {
                                    orderBy: { createdAt: 'desc' },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });
        return patients.map((patient) => {
            const latestSummary = patient.calls?.[0]?.conversations?.[0]?.summaries?.[0] ?? null;
            const { calls, ...rest } = patient;
            return {
                ...rest,
                latestSummary: latestSummary
                    ? {
                        shortSummary: latestSummary.shortSummary,
                        concern: latestSummary.concern,
                        symptoms: latestSummary.symptoms,
                        urgency: latestSummary.urgency,
                    }
                    : null,
            };
        });
    }
    async findOne(id) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
            include: {
                calls: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        conversations: {
                            include: {
                                summaries: true
                            }
                        }
                    }
                }
            }
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return patient;
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map
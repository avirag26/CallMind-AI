import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, CallStatus } from '@prisma/client';

@Injectable()
export class CallsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCall(data: Prisma.CallCreateInput) {
    return this.prisma.call.create({
      data,
    });
  }

  async findCallById(id: string) {
    return this.prisma.call.findUnique({
      where: { id },
    });
  }

  async updateCallStatus(id: string, status: CallStatus) {
    return this.prisma.call.update({
      where: { id },
      data: { status },
    });
  }

  async getActiveCalls() {
    return this.prisma.call.findMany({
      where: {
        status: { in: [CallStatus.RINGING, CallStatus.ANSWERED, CallStatus.AI_ACTIVE] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCallHistory() {
    return this.prisma.call.findMany({
      where: {
        status: { in: [CallStatus.COMPLETED, CallStatus.MISSED, CallStatus.REJECTED, CallStatus.FAILED] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

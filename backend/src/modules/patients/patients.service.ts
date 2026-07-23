import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(id: string) {
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
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
}

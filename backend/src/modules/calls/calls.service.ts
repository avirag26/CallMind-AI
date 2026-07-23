import { Injectable, NotFoundException } from '@nestjs/common';
import { CallsRepository } from './repositories/calls.repository';
import { CallStatus } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import pino from 'pino';
import { AiService } from '../ai/ai.service';

const logger = pino();

@Injectable()
export class CallsService {
  constructor(
    private readonly callsRepository: CallsRepository,
    private readonly eventsGateway: EventsGateway,
    @InjectQueue('call-timeout') private readonly callTimeoutQueue: Queue,
    private readonly aiService: AiService,
  ) {}

  async createMockCall(data: any) {
    const startedAt = new Date();
    const timeoutAt = new Date(startedAt.getTime() + 60000); // 60 seconds

    const call = await this.callsRepository.createCall({
      phoneNumber: data.phoneNumber,
      patientName: data.patientName,
      status: CallStatus.RINGING,
      startedAt,
      timeoutAt,
    });

    logger.info({ callId: call.id }, 'Call Started');

    this.eventsGateway.broadcastCallCreated(call);

    await this.callTimeoutQueue.add('timeout', { callId: call.id }, { delay: 60000 });

    return call;
  }

  async answerCall(id: string) {
    const call = await this.callsRepository.findCallById(id);
    if (!call) throw new NotFoundException('Call not found');

    const updated = await this.callsRepository.updateCallStatus(id, CallStatus.ANSWERED);
    logger.info({ callId: id }, 'Doctor Answered');
    
    // We ideally should remove the BullMQ job here, but this is simple enough for mock
    this.eventsGateway.broadcastCallUpdated(updated);
    return updated;
  }

  async rejectCall(id: string) {
    const call = await this.callsRepository.findCallById(id);
    if (!call) throw new NotFoundException('Call not found');

    const updated = await this.callsRepository.updateCallStatus(id, CallStatus.REJECTED);
    logger.info({ callId: id }, 'Doctor Rejected');
    this.eventsGateway.broadcastCallUpdated(updated);
    
    await this.startAiSession(id);
    return updated;
  }

  async endCall(id: string) {
    const call = await this.callsRepository.findCallById(id);
    if (!call) throw new NotFoundException('Call not found');

    const updated = await this.callsRepository.updateCallStatus(id, CallStatus.COMPLETED);
    logger.info({ callId: id }, 'Call Ended');
    this.eventsGateway.broadcastCallEnded(updated);
    return updated;
  }

  async handleCallTimeout(id: string) {
    const call = await this.callsRepository.findCallById(id);
    if (call && call.status === CallStatus.RINGING) {
      const updated = await this.callsRepository.updateCallStatus(id, CallStatus.MISSED);
      logger.info({ callId: id }, 'Timeout');
      this.eventsGateway.broadcastCallUpdated(updated);
      
      await this.startAiSession(id);
    }
  }

  async startAiSession(id: string) {
    const updated = await this.callsRepository.updateCallStatus(id, CallStatus.AI_ACTIVE);
    logger.info({ callId: id }, 'AI Started');
    
    // Auto start conversation
    const conversation = await this.aiService.initializeConversation(id);
    
    this.eventsGateway.broadcastAiStarted(updated);
    return updated;
  }

  async getCall(id: string) {
    return this.callsRepository.findCallById(id);
  }

  async getActiveCalls() {
    return this.callsRepository.getActiveCalls();
  }

  async getCallHistory() {
    return this.callsRepository.getCallHistory();
  }
}

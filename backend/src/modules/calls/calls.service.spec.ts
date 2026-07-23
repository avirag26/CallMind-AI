import { Test, TestingModule } from '@nestjs/testing';
import { CallsService } from './calls.service';
import { CallsRepository } from './repositories/calls.repository';
import { EventsGateway } from '../events/events.gateway';
import { getQueueToken } from '@nestjs/bullmq';
import { CallStatus } from '@prisma/client';

describe('CallsService', () => {
  let service: CallsService;
  let repository: any;
  let gateway: any;
  let queue: any;

  beforeEach(async () => {
    repository = {
      createCall: jest.fn(),
      findCallById: jest.fn(),
      updateCallStatus: jest.fn(),
    };
    gateway = {
      broadcastCallCreated: jest.fn(),
      broadcastCallUpdated: jest.fn(),
      broadcastCallEnded: jest.fn(),
      broadcastAiStarted: jest.fn(),
    };
    queue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        { provide: CallsRepository, useValue: repository },
        { provide: EventsGateway, useValue: gateway },
        { provide: getQueueToken('call-timeout'), useValue: queue },
      ],
    }).compile();

    service = module.get<CallsService>(CallsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createMockCall should create call, emit event, and add job', async () => {
    const mockData = { phoneNumber: '123', patientName: 'Test' };
    repository.createCall.mockResolvedValue({ id: 'uuid', status: CallStatus.RINGING });

    const result = await service.createMockCall(mockData);
    
    expect(repository.createCall).toHaveBeenCalled();
    expect(gateway.broadcastCallCreated).toHaveBeenCalledWith({ id: 'uuid', status: CallStatus.RINGING });
    expect(queue.add).toHaveBeenCalledWith('timeout', { callId: 'uuid' }, { delay: 60000 });
    expect(result.id).toBe('uuid');
  });

  it('answerCall should update status to ANSWERED', async () => {
    repository.findCallById.mockResolvedValue({ id: 'uuid', status: CallStatus.RINGING });
    repository.updateCallStatus.mockResolvedValue({ id: 'uuid', status: CallStatus.ANSWERED });

    const result = await service.answerCall('uuid');
    
    expect(repository.updateCallStatus).toHaveBeenCalledWith('uuid', CallStatus.ANSWERED);
    expect(gateway.broadcastCallUpdated).toHaveBeenCalledWith({ id: 'uuid', status: CallStatus.ANSWERED });
    expect(result.status).toBe(CallStatus.ANSWERED);
  });
});

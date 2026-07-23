import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { forwardRef, Inject } from '@nestjs/common';
import { CallsService } from '../calls/calls.service';

@Processor('call-timeout')
export class CallTimeoutProcessor extends WorkerHost {
  constructor(
    @Inject(forwardRef(() => CallsService))
    private readonly callsService: CallsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { callId } = job.data;
    console.log(`Processing call timeout for callId: ${callId}`);
    await this.callsService.handleCallTimeout(callId);
  }
}

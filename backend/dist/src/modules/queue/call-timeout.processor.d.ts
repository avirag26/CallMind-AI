import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CallsService } from '../calls/calls.service';
export declare class CallTimeoutProcessor extends WorkerHost {
    private readonly callsService;
    constructor(callsService: CallsService);
    process(job: Job<any, any, string>): Promise<any>;
}

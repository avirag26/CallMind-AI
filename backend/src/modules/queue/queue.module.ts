import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { CallTimeoutProcessor } from './call-timeout.processor';
import { CallsModule } from '../calls/calls.module';
import { forwardRef } from '@nestjs/common';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || 'callmindredispassword',
      },
    }),
    BullModule.registerQueue({
      name: 'call-timeout',
    }),
    forwardRef(() => CallsModule),
  ],
  controllers: [QueueController],
  providers: [QueueService, CallTimeoutProcessor],
  exports: [BullModule],
})
export class QueueModule {}

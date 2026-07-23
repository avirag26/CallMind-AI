import { Module, forwardRef } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { CallsRepository } from './repositories/calls.repository';
import { BullModule } from '@nestjs/bullmq';
import { EventsModule } from '../events/events.module';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    DatabaseModule,
    EventsModule,
    BullModule.registerQueue({
      name: 'call-timeout',
    }),
    AiModule,
  ],
  controllers: [CallsController],
  providers: [CallsService, CallsRepository],
  exports: [CallsService, CallsRepository],
})
export class CallsModule {}

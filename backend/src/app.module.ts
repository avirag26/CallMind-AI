import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PatientsModule } from './modules/patients/patients.module';
import { CallsModule } from './modules/calls/calls.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { CommonModule } from './modules/common/common.module';
import { ConfigModule } from './modules/config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { QueueModule } from './modules/queue/queue.module';
import { EventsModule } from './modules/events/events.module';
import { VoiceModule } from './modules/voice/voice.module';
import { TwilioModule } from './modules/twilio/twilio.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    OrganizationsModule, 
    DoctorsModule, 
    PatientsModule, 
    CallsModule, 
    AiModule, 
    NotificationsModule, 
    DashboardModule, 
    HealthModule, 
    CommonModule, 
    ConfigModule, 
    DatabaseModule, 
    QueueModule, 
    EventsModule, 
    VoiceModule,
    TwilioModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

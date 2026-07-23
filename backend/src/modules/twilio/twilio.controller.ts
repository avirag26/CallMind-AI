import { Controller, Post, Header, Logger } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('api/twilio')
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);

  constructor(private readonly twilioService: TwilioService) {}

  @Post('voice')
  @Header('Content-Type', 'application/xml')
  handleIncomingCall(): string {
    this.logger.log('Received incoming Twilio call request');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">
        Welcome to CallMind AI.
        This is a test call.
    </Say>
</Response>`;
  }
}

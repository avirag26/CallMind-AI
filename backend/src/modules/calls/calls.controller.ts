import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CallsService } from './calls.service';

@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('mock')
  async createMockCall(@Body() body: any) {
    return this.callsService.createMockCall(body);
  }

  @Post(':id/answer')
  async answerCall(@Param('id') id: string) {
    return this.callsService.answerCall(id);
  }

  @Post(':id/reject')
  async rejectCall(@Param('id') id: string) {
    return this.callsService.rejectCall(id);
  }

  @Post(':id/end')
  async endCall(@Param('id') id: string) {
    return this.callsService.endCall(id);
  }

  @Get('active')
  async getActiveCalls() {
    return this.callsService.getActiveCalls();
  }

  @Get('history')
  async getCallHistory() {
    return this.callsService.getCallHistory();
  }

  @Get(':id')
  async getCall(@Param('id') id: string) {
    return this.callsService.getCall(id);
  }
}

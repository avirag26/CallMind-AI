import { Controller, Get, Post, Body, Param, Sse, MessageEvent, Res } from '@nestjs/common';
import { AiService } from './ai.service';
import { SendMessageDto } from './dto/ai.dto';
import { Observable } from 'rxjs';
import type { Response } from 'express';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('conversation/:id')
  async getConversation(@Param('id') id: string) {
    return this.aiService.getConversation(id);
  }

  @Get('summary/:id')
  async getSummary(@Param('id') id: string) {
    return this.aiService.getSummary(id);
  }

  @Post('end/:id')
  async endConversation(@Param('id') id: string) {
    return this.aiService.generateSummary(id);
  }

  @Post('message/:id')
  async processMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.aiService.processMessage(id, dto.text);
      let fullText = '';
      let finalUsage = undefined;
      let finalModel = '';
      let finalProvider = '';

      for await (const chunk of stream) {
        if (chunk.content) {
          fullText += chunk.content;
          res.write(`data: ${JSON.stringify({ text: chunk.content })}\n\n`);
        }
        
        // At the end of the stream, generator returns the AIResponse object
        if ((chunk as any).usage || (chunk as any).provider) {
          const result = chunk as any;
          finalUsage = result.usage;
          finalModel = result.model;
          finalProvider = result.provider;
        }
      }

      // Save AI message to DB
      if (fullText.length > 0) {
        const msg = await this.aiService.saveAiMessage(id, fullText, finalUsage, finalModel, finalProvider);
        res.write(`data: ${JSON.stringify({ done: true, messageId: msg.id })}\n\n`);
      }

      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}

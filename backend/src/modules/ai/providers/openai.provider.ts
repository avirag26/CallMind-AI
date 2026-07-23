import OpenAI from 'openai';
import { IAIProvider, Message, StreamChunk, AIResponse } from '../interfaces/ai-provider.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly defaultModel = process.env.AI_MODEL || 'gpt-4o-mini';

  initialize(): void {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn('OPENAI_API_KEY is not set. AI provider will fail if called.');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY',
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  async generateResponse(messages: Message[]): Promise<AIResponse> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages,
      temperature: 0.7,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
      model: this.defaultModel,
      provider: this.getProviderName(),
    };
  }

  async generateJSONResponse(messages: Message[]): Promise<AIResponse> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages,
      temperature: 0.1, // Use low temperature for JSON to be deterministic
      response_format: { type: 'json_object' },
    });

    return {
      text: response.choices[0]?.message?.content || '{}',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
      model: this.defaultModel,
      provider: this.getProviderName(),
    };
  }

  async *generateStream(messages: Message[]): AsyncGenerator<StreamChunk, AIResponse, unknown> {
    const stream = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages,
      temperature: 0.7,
      stream: true,
      stream_options: { include_usage: true },
    });

    let fullText = '';
    let finalUsage: any = undefined;

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        const text = chunk.choices[0].delta.content;
        fullText += text;
        yield { content: text };
      }
      if (chunk.usage) {
        finalUsage = {
          promptTokens: chunk.usage.prompt_tokens,
          completionTokens: chunk.usage.completion_tokens,
          totalTokens: chunk.usage.total_tokens,
        };
      }
    }

    return {
      text: fullText,
      usage: finalUsage,
      model: this.defaultModel,
      provider: this.getProviderName(),
    };
  }
}

import { IAIProvider, Message, StreamChunk, AIResponse } from '../interfaces/ai-provider.interface';
export declare class OpenAIProvider implements IAIProvider {
    private openai;
    private readonly logger;
    private readonly defaultModel;
    initialize(): void;
    getProviderName(): string;
    generateResponse(messages: Message[]): Promise<AIResponse>;
    generateJSONResponse(messages: Message[]): Promise<AIResponse>;
    generateStream(messages: Message[]): AsyncGenerator<StreamChunk, AIResponse, unknown>;
}

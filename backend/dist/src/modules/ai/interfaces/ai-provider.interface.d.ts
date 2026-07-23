export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface StreamChunk {
    content: string;
}
export interface AIResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
    provider: string;
}
export interface IAIProvider {
    initialize(): void;
    generateResponse(messages: Message[]): Promise<AIResponse>;
    generateStream(messages: Message[]): AsyncGenerator<StreamChunk, AIResponse, unknown>;
    getProviderName(): string;
    generateJSONResponse(messages: Message[]): Promise<AIResponse>;
}

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
  /**
   * Initialize the provider with API keys/config
   */
  initialize(): void;

  /**
   * Generate a complete response block (non-streaming)
   */
  generateResponse(messages: Message[]): Promise<AIResponse>;

  /**
   * Generate a streaming response using async iterators
   */
  generateStream(messages: Message[]): AsyncGenerator<StreamChunk, AIResponse, unknown>;
  
  /**
   * Get the provider identifier (e.g. 'OpenAI', 'Anthropic')
   */
  getProviderName(): string;

  /**
   * Generate a structured JSON response
   */
  generateJSONResponse(messages: Message[]): Promise<AIResponse>;
}

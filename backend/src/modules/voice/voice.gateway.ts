import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { VoiceOrchestratorService } from './voice.service';
import { BrowserTransportAdapter } from './adapters/browser-transport.adapter';

@WebSocketGateway({ namespace: '/voice', cors: { origin: '*' } })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(VoiceGateway.name);
  
  // Track adapters by Socket ID
  private adapters = new Map<string, BrowserTransportAdapter>();

  constructor(private readonly voiceOrchestrator: VoiceOrchestratorService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const adapter = this.adapters.get(client.id);
    if (adapter) {
      adapter.pushEndSession();
      this.adapters.delete(client.id);
    }
  }

  @SubscribeMessage('start-session')
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string }
  ) {
    const { callId } = data;
    
    // Create the Browser Transport Adapter for this client
    const adapter = new BrowserTransportAdapter(client);
    this.adapters.set(client.id, adapter);
    
    // Pass strictly the adapter to the generic Orchestrator
    await this.voiceOrchestrator.attachTransport(callId, adapter);
    
    return { success: true };
  }

  @SubscribeMessage('audio-stream')
  handleAudioStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() chunk: Buffer
  ) {
    const adapter = this.adapters.get(client.id);
    if (adapter) {
      adapter.pushAudio(chunk);
    }
  }

  @SubscribeMessage('end-session')
  handleEndSession(@ConnectedSocket() client: Socket) {
    const adapter = this.adapters.get(client.id);
    if (adapter) {
      adapter.pushEndSession();
      this.adapters.delete(client.id);
    }
  }
}

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
import { VoiceService } from './voice.service';

@WebSocketGateway({ namespace: '/voice', cors: { origin: '*' } })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(VoiceGateway.name);

  constructor(private readonly voiceService: VoiceService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const callId = client.data.callId;
    if (callId) {
      this.voiceService.endSession(callId);
    }
  }

  @SubscribeMessage('start-session')
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string }
  ) {
    const { callId } = data;
    client.data.callId = callId;
    
    await this.voiceService.startSession(
      callId,
      (audioBuffer: Buffer) => {
        // Emit audio chunk to this specific client
        client.emit('audio-chunk', audioBuffer);
      },
      (state: any) => {
        // Emit state to this specific client
        client.emit('voice-state', state);
      }
    );
    
    return { success: true };
  }

  @SubscribeMessage('audio-stream')
  handleAudioStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() chunk: Buffer
  ) {
    const callId = client.data.callId;
    if (callId) {
      this.voiceService.handleAudioChunk(callId, chunk);
    }
  }

  @SubscribeMessage('end-session')
  handleEndSession(@ConnectedSocket() client: Socket) {
    const callId = client.data.callId;
    if (callId) {
      this.voiceService.endSession(callId);
      client.data.callId = null;
    }
  }
}

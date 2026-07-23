import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  broadcastCallCreated(call: any) {
    this.server.emit('CALL_CREATED', call);
  }

  broadcastCallUpdated(call: any) {
    this.server.emit('CALL_UPDATED', call);
  }

  broadcastCallEnded(call: any) {
    this.server.emit('CALL_ENDED', call);
  }

  broadcastAiStarted(call: any) {
    this.server.emit('AI_STARTED', call);
  }
}

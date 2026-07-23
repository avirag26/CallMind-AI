import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    broadcastCallCreated(call: any): void;
    broadcastCallUpdated(call: any): void;
    broadcastCallEnded(call: any): void;
    broadcastAiStarted(call: any): void;
}

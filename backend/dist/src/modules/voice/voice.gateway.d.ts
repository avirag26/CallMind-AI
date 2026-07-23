import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VoiceService } from './voice.service';
export declare class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly voiceService;
    server: Server;
    private readonly logger;
    constructor(voiceService: VoiceService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleStartSession(client: Socket, data: {
        callId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleAudioStream(client: Socket, chunk: Buffer): void;
    handleEndSession(client: Socket): void;
}

import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VoiceOrchestratorService } from './voice.service';
export declare class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly voiceOrchestrator;
    server: Server;
    private readonly logger;
    private adapters;
    constructor(voiceOrchestrator: VoiceOrchestratorService);
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

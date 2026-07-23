import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(data: any): Promise<{
        message: string;
        user: any;
    }>;
    validateUser(email: string, pass: string): Promise<any>;
}

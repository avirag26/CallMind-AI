import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
    }>;
    register(body: any): Promise<{
        message: string;
        user: any;
    }>;
    getProfile(req: any): any;
}

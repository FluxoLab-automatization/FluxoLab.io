import { JwtService } from '@nestjs/jwt';
export interface JwtPayload {
    sub: string;
    email: string;
}
export declare class TokenService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    generateToken(payload: JwtPayload): string;
    verifyToken<T extends object = JwtPayload>(token: string): T;
}

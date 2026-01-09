import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import {
    UnauthorizedException,
    ExecutionContext,
    CanActivate,
    Injectable,
} from "@nestjs/common";

@Injectable()
export class AuthGuardV1 implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            // Verifikasi token apakah valid
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.APP_AUTH_API_KEY,
            });

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request["user"] = payload;
        } catch {
            // Token tidak valid
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        // Tipe (Bearer) dan Token + Refresh Token
        const [type, tokenWithRefreshToken] =
            request.headers.authorization?.split(" ") ?? [];

        // Spacer antara token dan refresh-token
        const spacer: any = process.env.APP_AUTH_HEADERS_SPACER;

        // Token dan refresh-token
        const [realToken, refreshToken] =
            tokenWithRefreshToken.split(spacer) ?? [];

        // Pastikan token dan refresh-token di sematkan di header:
        // Authorization: Bearer <token---refresh-token>
        // --- berisi spacer pemisah token dan refresh-token, bisa dilihat di file .env
        return type === "Bearer" && refreshToken ? realToken : undefined;
    }
}

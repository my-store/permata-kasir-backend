import { IS_PUBLIC_KEY } from "./auth.bypass";
import { Reflector } from "@nestjs/core";
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
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        /* =======================================================
        |  PUBLIC ROUTES - BYPASS AUTHENTICATION
        |  =======================================================
        |  Seluruh route yang menggunakan dekorator Public akan
        |  dilakukan bypass, siapapun dapat mengakses tanpa login.
        */ const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            // Bypass security
            return true;
        }

        /* =======================================================
        |  PROTECTED ROUTES
        |  =======================================================
        |  Seluruh route yang tidak menggunakan dekorator Public
        |  tidak dapat diakses sebelum login.
        */
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
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" && token ? token : undefined;
    }
}

import { AuthControllerV1 } from "./v1/auth.controller.v1";
import { KasirModule } from "src/kasir/kasir.module";
import { AuthServiceV1 } from "./v1/auth.service.v1";
import { AdminModule } from "../admin/admin.module";
import { UserModule } from "../user/user.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        AdminModule,
        UserModule,
        KasirModule,
        JwtModule.register({
            global: true,
            secret: process.env.APP_AUTH_API_KEY,
            signOptions: {
                expiresIn: "1h", // 1 Jam
            },
        }),
    ],
    controllers: [AuthControllerV1],
    providers: [AuthServiceV1],
})
export class AuthModule {}

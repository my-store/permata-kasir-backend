import { KasirRefreshTokenServiceV1 } from "./v1/kasir.refresh.token.service.v1";
import { AdminServiceV1 } from "src/admin/v1/admin.service.v1";
import { KasirControllerV1 } from "./v1/kasir.controller.v1";
import { UserServiceV1 } from "src/user/v1/user.service.v1";
import { KasirServiceV1 } from "./v1/kasir.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    exports: [KasirServiceV1, KasirRefreshTokenServiceV1],
    controllers: [KasirControllerV1],
    providers: [
        KasirServiceV1,
        PrismaService,
        KasirRefreshTokenServiceV1,
        UserServiceV1,
        AdminServiceV1,
    ],
})
export class KasirModule {}

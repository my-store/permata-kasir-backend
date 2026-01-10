import { AdminRefreshTokenServiceV1 } from "./v1/admin.refresh.token.service.v1";
import { AdminControllerV1 } from "./v1/admin.controller.v1";
import { UserServiceV1 } from "src/user/v1/user.service.v1";
import { AdminServiceV1 } from "./v1/admin.service.v1";
import { PrismaService } from "../prisma.service";
import { Module } from "@nestjs/common";

@Module({
    exports: [AdminServiceV1, AdminRefreshTokenServiceV1],
    controllers: [AdminControllerV1],
    providers: [
        AdminServiceV1,
        PrismaService,
        UserServiceV1,
        AdminRefreshTokenServiceV1,
    ],
})
export class AdminModule {}

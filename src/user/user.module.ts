import { UserRegisterTicketControllerV1 } from "./v1/user.register.ticket.controller.v1";
import { UserRegisterTicketServiceV1 } from "./v1/user.register.ticket.service.v1";
import { UserRefreshTokenServiceV1 } from "./v1/user.refresh.token.service.v1";
import { AdminServiceV1 } from "src/admin/v1/admin.service.v1";
import { UserControllerV1 } from "./v1/user.controller.v1";
import { UserServiceV1 } from "./v1/user.service.v1";
import { PrismaService } from "../prisma.service";
import { Module } from "@nestjs/common";

@Module({
    exports: [UserServiceV1, UserRefreshTokenServiceV1],
    controllers: [UserControllerV1, UserRegisterTicketControllerV1],
    providers: [
        UserRegisterTicketServiceV1,
        PrismaService,
        AdminServiceV1,
        UserServiceV1,
        UserRefreshTokenServiceV1,
    ],
})
export class UserModule {}

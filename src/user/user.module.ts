import { UserRegisterTicketService } from "./user.register.ticket.service";
import { AdminService } from "src/admin/admin.service";
import { UserController } from "./user.controller";
import { PrismaService } from "../prisma.service";
import { UserService } from "./user.service";
import { Module } from "@nestjs/common";

@Module({
    exports: [UserService],
    controllers: [UserController],
    providers: [
        UserRegisterTicketService,
        PrismaService,
        AdminService,
        UserService,
    ],
})
export class UserModule {}

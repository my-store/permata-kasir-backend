import { MemberController } from "./member.controller";
import { PrismaService } from "src/prisma.service";
import { MemberService } from "./member.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [MemberController],
    providers: [MemberService, PrismaService],
})
export class MemberModule {}

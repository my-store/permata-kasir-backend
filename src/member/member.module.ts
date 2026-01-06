import { MemberControllerV1 } from "./v1/member.controller.v1";
import { MemberServiceV1 } from "./v1/member.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [MemberControllerV1],
    providers: [MemberServiceV1, PrismaService],
})
export class MemberModule {}

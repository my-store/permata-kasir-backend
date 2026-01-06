import { MemberRankControllerV1 } from "./v1/member.rank.controller.v1";
import { MemberRankServiceV1 } from "./v1/member.rank.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [MemberRankControllerV1],
    providers: [MemberRankServiceV1, PrismaService],
})
export class MemberRankModule {}

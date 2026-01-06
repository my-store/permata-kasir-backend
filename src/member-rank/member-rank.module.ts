import { MemberRankController } from "./member-rank.controller";
import { MemberRankService } from "./member-rank.service";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [MemberRankController],
    providers: [MemberRankService, PrismaService],
})
export class MemberRankModule {}

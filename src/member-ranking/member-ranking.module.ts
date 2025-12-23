import { MemberRankingController } from "./member-ranking.controller";
import { MemberRankingService } from "./member-ranking.service";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [MemberRankingController],
    providers: [MemberRankingService, PrismaService],
})
export class MemberRankingModule {}

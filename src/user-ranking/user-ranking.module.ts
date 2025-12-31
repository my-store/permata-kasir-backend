import { UserRankingController } from "./user-ranking.controller";
import { UserRankingService } from "./user-ranking.service";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [UserRankingController],
    providers: [UserRankingService, PrismaService],
})
export class UserRankingModule {}

import { UserRankingController } from "./user-ranking.controller";
import { UserRankingService } from "./user-ranking.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [UserRankingController],
    providers: [UserRankingService],
})
export class UserRankingModule {}

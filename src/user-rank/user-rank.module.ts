import { UserRankController } from "./user-rank.controller";
import { UserRankService } from "./user-rank.service";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [UserRankController],
    providers: [UserRankService, PrismaService],
})
export class UserRankModule {}

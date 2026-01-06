import { UserRankControllerV1 } from "./v1/user.rank.controller.v1";
import { UserRankServiceV1 } from "./v1/user.rank.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [UserRankControllerV1],
    providers: [UserRankServiceV1, PrismaService],
})
export class UserRankModule {}

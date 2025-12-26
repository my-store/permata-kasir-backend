import { MemberRankingController } from "./member-ranking.controller";
import { MemberRankingService } from "./member-ranking.service";
import { PrismaService } from "src/prisma.service";
import { UserModule } from "src/user/user.module";
import { Module } from "@nestjs/common";

@Module({
    imports: [UserModule],
    controllers: [MemberRankingController],
    providers: [MemberRankingService, PrismaService],
})
export class MemberRankingModule {}

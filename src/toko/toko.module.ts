import { TokoController } from "./toko.controller";
import { PrismaService } from "src/prisma.service";
import { TokoService } from "./toko.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [TokoController],
    providers: [TokoService, PrismaService],
})
export class TokoModule {}

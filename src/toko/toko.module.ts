import { TokoControllerV1 } from "./v1/toko.controller.v1";
import { TokoServiceV1 } from "./v1/toko.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [TokoControllerV1],
    providers: [TokoServiceV1, PrismaService],
})
export class TokoModule {}

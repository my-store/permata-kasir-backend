import { MonitorTokoControllerV1 } from "./v1/monitor.toko.controller.v1";
import { MonitorTokoServiceV1 } from "./v1/monitor.toko.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    exports: [MonitorTokoServiceV1],
    controllers: [MonitorTokoControllerV1],
    providers: [MonitorTokoServiceV1, PrismaService],
})
export class MonitorTokoModule {}

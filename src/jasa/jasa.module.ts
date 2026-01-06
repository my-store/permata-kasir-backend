import { JasaControllerV1 } from "./v1/jasa.controller.v1";
import { JasaServiceV1 } from "./v1/jasa.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [JasaControllerV1],
    providers: [JasaServiceV1, PrismaService],
})
export class JasaModule {}

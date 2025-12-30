import { PrismaService } from "src/prisma.service";
import { JasaController } from "./jasa.controller";
import { JasaService } from "./jasa.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [JasaController],
    providers: [JasaService, PrismaService],
})
export class JasaModule {}

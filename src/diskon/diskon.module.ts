import { DiskonControllerV1 } from "./v1/diskon.controller.v1";
import { DiskonServiceV1 } from "./v1/diskon.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [DiskonControllerV1],
    providers: [DiskonServiceV1, PrismaService],
})
export class DiskonModule {}

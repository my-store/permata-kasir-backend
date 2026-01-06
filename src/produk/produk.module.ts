import { ProdukControllerV1 } from "./v1/produk.controller.v1";
import { ProdukServiceV1 } from "./v1/produk.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [ProdukControllerV1],
    providers: [ProdukServiceV1, PrismaService],
})
export class ProdukModule {}

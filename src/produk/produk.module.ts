import { ProdukController } from "./produk.controller";
import { PrismaService } from "src/prisma.service";
import { ProdukService } from "./produk.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [ProdukController],
    providers: [ProdukService, PrismaService],
})
export class ProdukModule {}

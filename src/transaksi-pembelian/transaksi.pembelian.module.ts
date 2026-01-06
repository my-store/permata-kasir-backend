import { TransaksiPembelianControllerV1 } from "./v1/transaksi.pembelian.controller.v1";
import { TransaksiPembelianServiceV1 } from "./v1/transaksi.pembelian.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [TransaksiPembelianControllerV1],
    providers: [TransaksiPembelianServiceV1, PrismaService],
})
export class TransaksiPembelianModule {}

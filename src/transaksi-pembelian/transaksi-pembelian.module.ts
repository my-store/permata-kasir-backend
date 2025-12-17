import { TransaksiPembelianService } from "./transaksi-pembelian.service";
import { TransaksiPembelianController } from "./transaksi-pembelian.controller";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [TransaksiPembelianController],
    providers: [TransaksiPembelianService, PrismaService],
})
export class TransaksiPembelianModule {}

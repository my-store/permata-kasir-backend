import { TransaksiPenjualanService } from "./transaksi-penjualan.service";
import { TransaksiPenjualanController } from "./transaksi-penjualan.controller";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [TransaksiPenjualanController],
    providers: [TransaksiPenjualanService, PrismaService],
})
export class TransaksiPenjualanModule {}

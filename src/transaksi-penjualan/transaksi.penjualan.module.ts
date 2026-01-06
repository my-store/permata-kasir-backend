import { TransaksiPenjualanControllerV1 } from "./v1/transaksi.penjualan.controller.v1";
import { TransaksiPenjualanServiceV1 } from "./v1/transaksi.penjualan.service.v1";
import { PrismaService } from "src/prisma.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [TransaksiPenjualanControllerV1],
    providers: [TransaksiPenjualanServiceV1, PrismaService],
})
export class TransaksiPenjualanModule {}

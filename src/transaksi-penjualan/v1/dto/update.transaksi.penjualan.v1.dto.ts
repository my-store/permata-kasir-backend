import { CreateTransaksiPenjualanDtoV1 } from "./create.transaksi.penjualan.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateTransaksiPenjualanDtoV1 extends PartialType(
    CreateTransaksiPenjualanDtoV1,
) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

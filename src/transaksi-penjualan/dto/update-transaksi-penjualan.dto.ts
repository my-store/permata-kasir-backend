import { CreateTransaksiPenjualanDto } from "./create-transaksi-penjualan.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateTransaksiPenjualanDto extends PartialType(
    CreateTransaksiPenjualanDto,
) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

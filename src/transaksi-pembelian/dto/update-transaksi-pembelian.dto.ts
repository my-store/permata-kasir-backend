import { CreateTransaksiPembelianDto } from "./create-transaksi-pembelian.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateTransaksiPembelianDto extends PartialType(
    CreateTransaksiPembelianDto,
) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

import { CreateTransaksiPembelianDtoV1 } from "./create.transaksi.pembelian.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateTransaksiPembelianDtoV1 extends PartialType(
    CreateTransaksiPembelianDtoV1,
) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

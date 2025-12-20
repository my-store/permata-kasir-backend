import { IsNotEmpty } from "class-validator";

export class CreateTransaksiPenjualanDto {
    @IsNotEmpty()
    produk: string;

    @IsNotEmpty()
    tokoId: string;
}

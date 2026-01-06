import { IsNotEmpty } from "class-validator";

export class CreateTransaksiPenjualanDtoV1 {
    @IsNotEmpty()
    produk: string;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

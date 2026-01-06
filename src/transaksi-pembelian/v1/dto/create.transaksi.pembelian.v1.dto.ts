import { IsNotEmpty } from "class-validator";

export class CreateTransaksiPembelianDtoV1 {
    @IsNotEmpty()
    produk: string;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

import { IsNotEmpty } from "class-validator";

export class CreateTransaksiPembelianDto {
    @IsNotEmpty()
    produk: string;

    @IsNotEmpty()
    tokoId: string;
}

import { IsNotEmpty } from "class-validator";

export class CreateProdukDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    hargaPokok: string;

    @IsNotEmpty()
    hargaJual: string;

    @IsNotEmpty()
    stok: string;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

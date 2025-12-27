import { IsNotEmpty } from "class-validator";

export class CreateProdukDto {
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

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;
}

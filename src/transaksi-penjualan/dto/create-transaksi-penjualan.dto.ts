import { IsNotEmpty } from "class-validator";

export class CreateTransaksiPenjualanDto {
    @IsNotEmpty()
    produk: string;

    @IsNotEmpty()
    tokoId: number;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;
}

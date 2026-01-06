import { IsNotEmpty } from "class-validator";

export class CreateUserRankDto {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    maxToko: number;

    @IsNotEmpty()
    maxProduk: number;

    @IsNotEmpty()
    maxJasa: number;
}

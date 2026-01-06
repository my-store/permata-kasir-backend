import { IsNotEmpty } from "class-validator";

export class CreateUserRankDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    maxToko: number;

    @IsNotEmpty()
    maxProduk: number;

    @IsNotEmpty()
    maxJasa: number;
}

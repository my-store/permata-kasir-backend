import { IsNotEmpty } from "class-validator";

export class CreateKasirDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

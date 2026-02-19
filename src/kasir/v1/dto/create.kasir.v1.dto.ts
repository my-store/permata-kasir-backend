import { IsNotEmpty } from "class-validator";

export class CreateKasirDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    tokoId: string;

    @IsNotEmpty()
    userId: string;

    foto?: string;
}

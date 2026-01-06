import { IsNotEmpty } from "class-validator";

export class CreateTokoDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    alamat: string;

    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    userId: number;

    uuid?: number;
}

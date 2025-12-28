import { IsNotEmpty } from "class-validator";

export class CreateTokoDto {
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

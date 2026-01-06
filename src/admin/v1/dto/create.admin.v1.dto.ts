import { IsNotEmpty } from "class-validator";

export class CreateAdminDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    alamat: string;

    foto?: string;
}

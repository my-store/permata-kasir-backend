import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
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

export class CreateUserRegisterTicketDto {
    @IsNotEmpty()
    adminId: string;
}

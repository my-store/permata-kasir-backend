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

    @IsNotEmpty()
    userRankingId: number;

    foto?: string;
}

export class CreateUserRegisterTicketDto {
    @IsNotEmpty()
    adminId: number;

    @IsNotEmpty()
    userRankingId: number;
}

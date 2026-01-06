import { IsNotEmpty } from "class-validator";

export class CreateUserDtoV1 {
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

export class CreateUserRegisterTicketDtoV1 {
    @IsNotEmpty()
    adminId: number;

    @IsNotEmpty()
    userRankingId: number;
}

import { IsNotEmpty } from "class-validator";

export class CreateMemberDto {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    alamat: string;

    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;

    memberRankingId?: number;
}

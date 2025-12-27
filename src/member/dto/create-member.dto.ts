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

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;
}

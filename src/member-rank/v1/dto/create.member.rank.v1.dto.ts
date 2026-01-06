import { IsNotEmpty } from "class-validator";

export class CreateMemberRankDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    potonganBelanja: number;

    @IsNotEmpty()
    tokoId: number;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;
}

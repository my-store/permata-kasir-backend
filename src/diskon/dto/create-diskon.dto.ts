import { IsNotEmpty } from "class-validator";

export class CreateDiskonDto {
    @IsNotEmpty()
    keterangan: string;

    @IsNotEmpty()
    nilai: string;

    @IsNotEmpty()
    tokoId: number;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;
}

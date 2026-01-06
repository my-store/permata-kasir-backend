import { IsNotEmpty } from "class-validator";

export class CreateDiskonDtoV1 {
    @IsNotEmpty()
    keterangan: string;

    @IsNotEmpty()
    nilai: string;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

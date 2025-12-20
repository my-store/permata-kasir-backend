import { IsNotEmpty } from "class-validator";

export class CreateDiskonDto {
    @IsNotEmpty()
    keterangan: string;

    @IsNotEmpty()
    nilai: string;

    @IsNotEmpty()
    tokoId: string;
}

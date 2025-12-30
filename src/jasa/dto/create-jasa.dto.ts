import { IsNotEmpty } from "class-validator";

export class CreateJasaDto {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    biaya: number;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

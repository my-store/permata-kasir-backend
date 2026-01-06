import { IsNotEmpty } from "class-validator";

export class CreateJasaDtoV1 {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    biaya: number;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

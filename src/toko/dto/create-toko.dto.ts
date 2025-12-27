import { IsNotEmpty } from "class-validator";

export class CreateTokoDto {
    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    alamat: string;

    @IsNotEmpty()
    tlp: string;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;
}

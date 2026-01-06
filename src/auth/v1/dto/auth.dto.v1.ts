import { IsNotEmpty } from "class-validator";

export class AuthLoginDtoV1 {
    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    pass: string;
}

export class AuthRefreshDtoV1 {
    @IsNotEmpty()
    tlp: string;
}

export class AuthAddDevAccountDtoV1 {
    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    nama: string;

    @IsNotEmpty()
    password: string;

    foto?: string;
}

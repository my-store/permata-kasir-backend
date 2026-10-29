import { IsNotEmpty } from "class-validator";

export class AuthLoginDataDataDtoV1 {
    tlp: string;
    password: string;
    app_name: string;
}

export class AuthLoginDtoV1 {
    @IsNotEmpty()
    data: string;
}

export class AuthRefreshDtoV1 {
    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    access_token: string;

    @IsNotEmpty()
    refresh_token: string;
}

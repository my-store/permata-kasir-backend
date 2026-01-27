import { IsNotEmpty } from "class-validator";

export class AuthLoginDtoV1 {
    @IsNotEmpty()
    tlp: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    app_name: string;
}

export class AuthRefreshDtoV1 {
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    refresh_token: string;
}

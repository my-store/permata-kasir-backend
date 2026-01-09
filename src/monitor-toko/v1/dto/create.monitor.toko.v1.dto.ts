import { IsNotEmpty } from "class-validator";

export class CreateMonitorTokoDtoV1 {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    tokoId: number;

    @IsNotEmpty()
    userId: number;
}

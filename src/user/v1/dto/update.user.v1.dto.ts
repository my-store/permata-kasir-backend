import { CreateUserDtoV1 } from "./create.user.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateUserDtoV1 extends PartialType(CreateUserDtoV1) {
    // 6 January 2026 - Security Update
    userRankId?: number;
}

export class UpdateUserPasswordDtoV1 {
    @IsNotEmpty()
    password: string;
}

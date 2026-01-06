import { CreateUserDtoV1 } from "./create.user.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateUserDtoV1 extends PartialType(CreateUserDtoV1) {}

export class UpdateUserPasswordDtoV1 {
    @IsNotEmpty()
    password: string;
}

import { CreateAdminDtoV1 } from "./create.admin.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateAdminDtoV1 extends PartialType(CreateAdminDtoV1) {}

export class UpdateAdminPasswordDtoV1 {
    @IsNotEmpty()
    password: string;
}

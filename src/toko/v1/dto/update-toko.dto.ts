import { CreateTokoDtoV1 } from "./create.toko.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateTokoDtoV1 extends PartialType(CreateTokoDtoV1) {
    // Only for security purpose
    @IsNotEmpty()
    userId: number;
}

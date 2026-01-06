import { CreateDiskonDtoV1 } from "./create-diskon.dto.v1";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateDiskonDtoV1 extends PartialType(CreateDiskonDtoV1) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

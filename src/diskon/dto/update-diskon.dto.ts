import { CreateDiskonDto } from "./create-diskon.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateDiskonDto extends PartialType(CreateDiskonDto) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

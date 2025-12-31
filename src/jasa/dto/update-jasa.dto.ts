import { PartialType } from "@nestjs/mapped-types";
import { CreateJasaDto } from "./create-jasa.dto";
import { IsNotEmpty } from "class-validator";

export class UpdateJasaDto extends PartialType(CreateJasaDto) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

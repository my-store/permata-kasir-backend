import { CreateJasaDtoV1 } from "./create.jasa.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateJasaDtoV1 extends PartialType(CreateJasaDtoV1) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

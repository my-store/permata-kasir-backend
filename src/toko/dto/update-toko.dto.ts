import { PartialType } from "@nestjs/mapped-types";
import { CreateTokoDto } from "./create-toko.dto";
import { IsNotEmpty } from "class-validator";

export class UpdateTokoDto extends PartialType(CreateTokoDto) {
    // Only for security purpose
    @IsNotEmpty()
    userId: number;
}

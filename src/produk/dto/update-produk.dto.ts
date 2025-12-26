import { CreateProdukDto } from "./create-produk.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateProdukDto extends PartialType(CreateProdukDto) {
    @IsNotEmpty()
    tokoId: number;

    // Only for security purpose
    @IsNotEmpty()
    userId: number;
}

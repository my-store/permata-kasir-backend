import { CreateProdukDto } from "./create-produk.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateProdukDto extends PartialType(CreateProdukDto) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

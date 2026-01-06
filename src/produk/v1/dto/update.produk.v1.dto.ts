import { CreateProdukDtoV1 } from "./create.produk.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateProdukDtoV1 extends PartialType(CreateProdukDtoV1) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

import { CreateProdukDtoV1 } from "./create.produk.v1.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateProdukDtoV1 extends PartialType(CreateProdukDtoV1) {}

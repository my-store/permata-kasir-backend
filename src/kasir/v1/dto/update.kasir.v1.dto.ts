import { CreateKasirDtoV1 } from "./create.kasir.v1.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateKasirDtoV1 extends PartialType(CreateKasirDtoV1) {}

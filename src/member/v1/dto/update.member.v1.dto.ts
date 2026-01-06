import { CreateMemberDtoV1 } from "./create.member.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateMemberDtoV1 extends PartialType(CreateMemberDtoV1) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

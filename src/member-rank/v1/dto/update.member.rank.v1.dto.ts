import { CreateMemberRankDtoV1 } from "./create.member.rank.v1.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateMemberRankDtoV1 extends PartialType(CreateMemberRankDtoV1) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

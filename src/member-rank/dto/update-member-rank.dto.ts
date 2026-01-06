import { CreateMemberRankDto } from "./create-member-rank.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateMemberRankDto extends PartialType(CreateMemberRankDto) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

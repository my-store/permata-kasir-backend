import { CreateMemberRankingDto } from "./create-member-ranking.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class UpdateMemberRankingDto extends PartialType(
    CreateMemberRankingDto,
) {
    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    userId: number;

    // To verify, make sure this input is by owner (user)
    @IsNotEmpty()
    tokoId: number;
}

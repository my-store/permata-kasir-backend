import { PartialType } from "@nestjs/mapped-types";
import { CreateUserRankDto } from "./create-user-rank.dto";

export class UpdateUserRankDto extends PartialType(CreateUserRankDto) {}

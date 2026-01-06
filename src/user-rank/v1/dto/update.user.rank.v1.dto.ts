import { CreateUserRankDtoV1 } from "./create.user.rank.v1.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateUserRankDtoV1 extends PartialType(CreateUserRankDtoV1) {}

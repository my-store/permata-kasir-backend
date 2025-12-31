import { PartialType } from '@nestjs/mapped-types';
import { CreateUserRankingDto } from './create-user-ranking.dto';

export class UpdateUserRankingDto extends PartialType(CreateUserRankingDto) {}

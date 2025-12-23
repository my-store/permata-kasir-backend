import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberRankingDto } from './create-member-ranking.dto';

export class UpdateMemberRankingDto extends PartialType(CreateMemberRankingDto) {}

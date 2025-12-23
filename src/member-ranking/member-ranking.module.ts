import { Module } from '@nestjs/common';
import { MemberRankingService } from './member-ranking.service';
import { MemberRankingController } from './member-ranking.controller';

@Module({
  controllers: [MemberRankingController],
  providers: [MemberRankingService],
})
export class MemberRankingModule {}

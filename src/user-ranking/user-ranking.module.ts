import { Module } from '@nestjs/common';
import { UserRankingService } from './user-ranking.service';
import { UserRankingController } from './user-ranking.controller';

@Module({
  controllers: [UserRankingController],
  providers: [UserRankingService],
})
export class UserRankingModule {}

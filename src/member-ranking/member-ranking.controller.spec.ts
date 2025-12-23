import { Test, TestingModule } from '@nestjs/testing';
import { MemberRankingController } from './member-ranking.controller';
import { MemberRankingService } from './member-ranking.service';

describe('MemberRankingController', () => {
  let controller: MemberRankingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberRankingController],
      providers: [MemberRankingService],
    }).compile();

    controller = module.get<MemberRankingController>(MemberRankingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

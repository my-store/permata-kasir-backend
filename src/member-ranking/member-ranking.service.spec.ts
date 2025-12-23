import { Test, TestingModule } from '@nestjs/testing';
import { MemberRankingService } from './member-ranking.service';

describe('MemberRankingService', () => {
  let service: MemberRankingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberRankingService],
    }).compile();

    service = module.get<MemberRankingService>(MemberRankingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

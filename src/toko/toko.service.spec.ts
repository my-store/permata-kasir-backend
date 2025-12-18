import { Test, TestingModule } from '@nestjs/testing';
import { TokoService } from './toko.service';

describe('TokoService', () => {
  let service: TokoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokoService],
    }).compile();

    service = module.get<TokoService>(TokoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

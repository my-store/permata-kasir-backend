import { Test, TestingModule } from '@nestjs/testing';
import { JasaService } from './jasa.service';

describe('JasaService', () => {
  let service: JasaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JasaService],
    }).compile();

    service = module.get<JasaService>(JasaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

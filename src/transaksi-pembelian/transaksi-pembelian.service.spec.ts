import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiPembelianService } from './transaksi-pembelian.service';

describe('TransaksiPembelianService', () => {
  let service: TransaksiPembelianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransaksiPembelianService],
    }).compile();

    service = module.get<TransaksiPembelianService>(TransaksiPembelianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

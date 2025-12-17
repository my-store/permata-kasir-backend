import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiPenjualanService } from './transaksi-penjualan.service';

describe('TransaksiPenjualanService', () => {
  let service: TransaksiPenjualanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransaksiPenjualanService],
    }).compile();

    service = module.get<TransaksiPenjualanService>(TransaksiPenjualanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

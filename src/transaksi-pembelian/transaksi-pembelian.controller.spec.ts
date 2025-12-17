import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiPembelianController } from './transaksi-pembelian.controller';
import { TransaksiPembelianService } from './transaksi-pembelian.service';

describe('TransaksiPembelianController', () => {
  let controller: TransaksiPembelianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransaksiPembelianController],
      providers: [TransaksiPembelianService],
    }).compile();

    controller = module.get<TransaksiPembelianController>(TransaksiPembelianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

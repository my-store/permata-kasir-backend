import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiPenjualanController } from './transaksi-penjualan.controller';
import { TransaksiPenjualanService } from './transaksi-penjualan.service';

describe('TransaksiPenjualanController', () => {
  let controller: TransaksiPenjualanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransaksiPenjualanController],
      providers: [TransaksiPenjualanService],
    }).compile();

    controller = module.get<TransaksiPenjualanController>(TransaksiPenjualanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

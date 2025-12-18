import { Test, TestingModule } from '@nestjs/testing';
import { TokoController } from './toko.controller';
import { TokoService } from './toko.service';

describe('TokoController', () => {
  let controller: TokoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokoController],
      providers: [TokoService],
    }).compile();

    controller = module.get<TokoController>(TokoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

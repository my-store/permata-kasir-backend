import { Test, TestingModule } from '@nestjs/testing';
import { JasaController } from './jasa.controller';
import { JasaService } from './jasa.service';

describe('JasaController', () => {
  let controller: JasaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JasaController],
      providers: [JasaService],
    }).compile();

    controller = module.get<JasaController>(JasaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

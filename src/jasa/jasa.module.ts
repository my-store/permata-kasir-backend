import { Module } from '@nestjs/common';
import { JasaService } from './jasa.service';
import { JasaController } from './jasa.controller';

@Module({
  controllers: [JasaController],
  providers: [JasaService],
})
export class JasaModule {}

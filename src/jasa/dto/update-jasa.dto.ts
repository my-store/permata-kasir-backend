import { PartialType } from '@nestjs/mapped-types';
import { CreateJasaDto } from './create-jasa.dto';

export class UpdateJasaDto extends PartialType(CreateJasaDto) {}

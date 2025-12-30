import { Injectable } from '@nestjs/common';
import { CreateJasaDto } from './dto/create-jasa.dto';
import { UpdateJasaDto } from './dto/update-jasa.dto';

@Injectable()
export class JasaService {
  create(createJasaDto: CreateJasaDto) {
    return 'This action adds a new jasa';
  }

  findAll() {
    return `This action returns all jasa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jasa`;
  }

  update(id: number, updateJasaDto: UpdateJasaDto) {
    return `This action updates a #${id} jasa`;
  }

  remove(id: number) {
    return `This action removes a #${id} jasa`;
  }
}

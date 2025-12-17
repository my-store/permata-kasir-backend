import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaksiPembelianDto } from './create-transaksi-pembelian.dto';

export class UpdateTransaksiPembelianDto extends PartialType(CreateTransaksiPembelianDto) {}

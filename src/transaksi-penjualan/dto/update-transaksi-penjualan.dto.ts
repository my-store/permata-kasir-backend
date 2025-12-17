import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaksiPenjualanDto } from './create-transaksi-penjualan.dto';

export class UpdateTransaksiPenjualanDto extends PartialType(CreateTransaksiPenjualanDto) {}

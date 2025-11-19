import { IsNotEmpty } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  nama: string;

  @IsNotEmpty()
  tlp: string;

  @IsNotEmpty()
  password: string;

  foto?: string;
}

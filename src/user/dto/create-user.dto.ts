import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  nama: string;

  @IsNotEmpty()
  tlp: string;

  @IsNotEmpty()
  password: string;

  foto?: string;
}

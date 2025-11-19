import { IsNotEmpty } from 'class-validator';

export class AuthLoginDto {
  @IsNotEmpty()
  tlp: string;

  @IsNotEmpty()
  pass: string;
}

export class AuthRefreshDto {
  @IsNotEmpty()
  tlp: string;
}

export class AuthAddDevAccountDto {
  @IsNotEmpty()
  tlp: string;

  @IsNotEmpty()
  nama: string;

  @IsNotEmpty()
  password: string;

  foto?: string;
}

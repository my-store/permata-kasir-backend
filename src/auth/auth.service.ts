import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Admin, User } from '../../generated/prisma/client';
import { AdminService } from '../admin/admin.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface FindAdminOrUser {
  data: Admin | User;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly admin: AdminService,
    private readonly user: UserService,
    private readonly jwt: JwtService,
  ) {}

  async findAdminOrUser(tlp: string): Promise<FindAdminOrUser> {
    let data: any;
    let role: string = '';

    // Try find admin first
    try {
      data = await this.admin.findOne({ where: { tlp } });
      role = 'Admin';
    } catch (error) {}

    // Admin not found, try find User
    if (!data) {
      try {
        data = await this.user.findOne({ where: { tlp } });
        role = 'User';
      } catch (error) {}
    }

    return { data, role };
  }

  async signIn(tlp: string, pass: string): Promise<any> {
    const { data, role }: any = await this.findAdminOrUser(tlp);

    // Admin or User not found
    if (!data) {
      // Terminate task
      throw new UnauthorizedException('Akun tidak ditemukan!');
    }

    // Compare password
    const correctPassword = bcrypt.compareSync(pass, data.password);

    // Wrong password
    if (!correctPassword) {
      throw new UnauthorizedException('Password salah!');
    }

    // User rules
    if (role == 'User') {
      // Blocked | banned account | not activated yet
      if (!data.active) {
        // Blocked or banned
        if (data.deactivatedAt.length > 0) {
          // Terminate task
          throw new UnauthorizedException('Akun anda telah di blokir!');
        }

        // Not activated (make sure deactivatedAt is empty string)
        else {
          // Terminate task
          throw new UnauthorizedException(
            'Akun anda belum di aktivasi, silahkan menghubungi admin.',
          );
        }
      }
    }

    // Create JWT token
    return this.createJwt(data, role);
  }

  async createJwt(person: Admin | User, role: string): Promise<any> {
    const payload = { sub: person.tlp, role };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, role };
  }

  async refresh(tlp: string): Promise<void> {
    // Ambil data user/admin
    const { data, role }: any = await this.findAdminOrUser(tlp);

    // Admin or User not found
    if (!data) {
      // Terminate task
      throw new UnauthorizedException('Akun tidak ditemukan!');
    }

    // --------------------------------------------------------------
    // SOON
    // --------------------------------------------------------------
    // Disini akan dilakukan pengecekan pada database token,
    // jika data tidak benar, blokir permintaan refresh token.
    // --------------------------------------------------------------
    // Jangan lupa buat dulu tabel untuk menyimpan token di database.
    // --------------------------------------------------------------

    // Buat token baru
    return this.createJwt(data, role);
  }
}

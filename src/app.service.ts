import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin/admin.service';
import { UserService } from './user/user.service';
import { Admin, User } from 'generated/prisma';

@Injectable()
export class AppService {
  constructor(
    private readonly admin: AdminService,
    private readonly user: UserService,
  ) {}

  async update(tlp: string, role: string, newData: any): Promise<Admin | User> {
    let updatedData: any = null;

    // Update admin
    if (role == 'Admin') {
      try {
        updatedData = await this.admin.update({ tlp }, newData);
      } catch {}
    }

    // Update User
    if (role == 'User') {
      try {
        updatedData = await this.user.update({ tlp }, newData);
      } catch {}
    }

    // An error occured while updating data
    if (!updatedData) {
      // Terminate task
      throw new UnauthorizedException();
    }

    // Updated data
    return updatedData;
  }

  async login(tlp: string, role: string): Promise<Admin | User> {
    return this.update(tlp, role, { online: true });
  }

  async logout(tlp: string, role: string): Promise<Admin | User> {
    return this.update(tlp, role, {
      online: false,
      lastOnline: new Date().toISOString(),
    });
  }
}

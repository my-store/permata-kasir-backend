import { Prisma, User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { encryptPassword } from '../libs/bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly findOneKeys: Prisma.UserSelect = {
    id: true,
    nama: true,
    tlp: true,
    password: true,
    foto: true,
    online: true,
    lastOnline: true,
    active: true,
    deactivatedAt: true,
    createdAt: true,
    updatedAt: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<User> {
    let newData: Prisma.UserCreateInput = { ...data };

    // Konfigurasi timestamp
    const thisTime = new Date().toISOString();
    newData.createdAt = thisTime;
    newData.updatedAt = thisTime;

    // Enkripsi password
    newData.password = encryptPassword(newData.password);

    // Save a new data
    return this.prisma.user.create({ data: newData });
  }

  async update(where: Prisma.UserWhereUniqueInput, data: any): Promise<User> {
    let updatedData: Prisma.UserUpdateInput = { ...data };

    // Konfigurasi timestamp
    const thisTime = new Date().toISOString();
    updatedData.updatedAt = thisTime;

    // Save updated data
    return this.prisma.user.update({ where, data: updatedData });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(params: {
    select?: Prisma.UserSelect;
    where: Prisma.UserWhereUniqueInput;
  }): Promise<User | null> {
    const { select, where } = params;
    return this.prisma.user.findUnique({
      select: { ...this.findOneKeys, ...select },
      where,
    });
  }

  async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }
}

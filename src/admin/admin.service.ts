import { Admin, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { encryptPassword } from 'src/libs/bcrypt';
import { Injectable } from '@nestjs/common';

function getDevPhoneFromEnv(): string {
  const tlp: any = process.env.APP_OWNER_PHONE;
  return tlp.replace('(+62)', '0').replace(/\s/g, '').replace(/\-/g, '');
}

@Injectable()
export class AdminService {
  private readonly findAllKeys: Prisma.AdminSelect = {
    id: true,
    nama: true,
    tlp: true,
    foto: true,
    online: true,
    lastOnline: true,
    createdAt: true,
    updatedAt: true,
  };

  private readonly findOneKeys: Prisma.AdminSelect = {
    id: true,
    nama: true,
    tlp: true,
    password: true,
    foto: true,
    online: true,
    lastOnline: true,
    createdAt: true,
    updatedAt: true,
  };

  private readonly getAllFilter: Prisma.AdminWhereInput = {
    // Filter by phone number
    tlp: {
      // Developer phone
      not: getDevPhoneFromEnv(),
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Admin> {
    let newData: Prisma.AdminCreateInput = { ...data };

    // Konfigurasi timestamp
    const thisTime = new Date().toISOString();
    newData.createdAt = thisTime;
    newData.updatedAt = thisTime;

    // Enkripsi password
    newData.password = encryptPassword(newData.password);

    // Save a new data
    return this.prisma.admin.create({ data: newData });
  }

  async update(where: Prisma.AdminWhereUniqueInput, data: any): Promise<Admin> {
    let updatedData: Prisma.AdminUpdateInput = { ...data };

    // Konfigurasi timestamp
    const thisTime = new Date().toISOString();
    updatedData.updatedAt = thisTime;

    // Save updated data
    return this.prisma.admin.update({ where, data: updatedData });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    select?: Prisma.AdminSelect;
    cursor?: Prisma.AdminWhereUniqueInput;
    where?: Prisma.AdminWhereInput;
    orderBy?: Prisma.AdminOrderByWithRelationInput;
  }): Promise<Admin[]> {
    const { skip, take, select, cursor, where, orderBy } = params;
    return this.prisma.admin.findMany({
      skip,
      take,
      select: {
        ...this.findAllKeys,
        ...select,
      },
      cursor,
      where: {
        ...where,

        // Exception filter
        ...this.getAllFilter,
      },
      orderBy,
    });
  }

  async findOne(params: {
    select?: Prisma.AdminSelect;
    where: Prisma.AdminWhereUniqueInput;
  }): Promise<Admin | null> {
    const { select, where } = params;
    return this.prisma.admin.findUnique({
      select: { ...this.findOneKeys, ...select },
      where,
    });
  }

  async remove(where: Prisma.AdminWhereUniqueInput): Promise<Admin> {
    return this.prisma.admin.delete({ where });
  }
}

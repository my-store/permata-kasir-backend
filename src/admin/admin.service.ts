import { PrismaService } from "../prisma.service";
import { encryptPassword } from "src/libs/bcrypt";
import { Admin, Prisma } from "models/client";
import { Injectable } from "@nestjs/common";

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

    constructor(private readonly prisma: PrismaService) {}

    async create(newData: any): Promise<Admin> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // Prepare data
        const data: Prisma.AdminCreateInput = {
            ...newData,

            // Enkripsi password
            password: encryptPassword(newData.password),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.admin.create({ data });
    }

    async update(
        where: Prisma.AdminWhereUniqueInput,
        data: any,
    ): Promise<Admin> {
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
            where,
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

import { PrismaService } from "src/prisma.service";
import { Toko, Prisma } from "prisma/generated";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TokoService {
    private readonly findAllKeys: Prisma.TokoSelect = {
        id: true,
        nama: true,
        alamat: true,
        tlp: true,
        createdAt: true,
        updatedAt: true,
    };

    private readonly findOneKeys: Prisma.TokoSelect = {
        id: true,
        nama: true,
        alamat: true,
        tlp: true,
        createdAt: true,
        updatedAt: true,

        user: {
            select: {
                nama: true,
                alamat: true,
                tlp: true,
            },
        },
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(data: any): Promise<Toko> {
        let newData: Prisma.TokoCreateInput = {
            ...data,

            // Parse to integer
            userId: parseInt(data.userId),
        };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        newData.createdAt = thisTime;
        newData.updatedAt = thisTime;

        // Save a new data
        return this.prisma.toko.create({ data: newData });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.TokoSelect;
        cursor?: Prisma.TokoWhereUniqueInput;
        where?: Prisma.TokoWhereInput;
        orderBy?: Prisma.TokoOrderByWithRelationInput;
    }): Promise<Toko[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.toko.findMany({
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
        select?: Prisma.TokoSelect;
        where: Prisma.TokoWhereUniqueInput;
    }): Promise<Toko | null> {
        const { select, where } = params;
        return this.prisma.toko.findUnique({
            select: { ...this.findOneKeys, ...select },
            where,
        });
    }

    async update(where: Prisma.TokoWhereUniqueInput, data: any): Promise<Toko> {
        let updatedData: Prisma.TokoUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.toko.update({ where, data: updatedData });
    }

    async remove(where: Prisma.TokoWhereUniqueInput): Promise<Toko> {
        return this.prisma.toko.delete({ where });
    }
}

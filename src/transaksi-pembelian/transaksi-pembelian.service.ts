import { Prisma, TransaksiPembelian } from "models";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TransaksiPembelianService {
    private readonly findAllKeys: Prisma.TransaksiPembelianSelect = {
        id: true,
        createdAt: true,
        updatedAt: true,
    };

    private readonly findOneKeys: Prisma.TransaksiPembelianSelect = {
        id: true,
        createdAt: true,
        updatedAt: true,
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(data: any): Promise<TransaksiPembelian> {
        let newData: Prisma.TransaksiPembelianCreateInput = {
            ...data,

            // Parse to integer
            tokoId: parseInt(data.tokoId),
        };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        newData.createdAt = thisTime;
        newData.updatedAt = thisTime;

        // Save a new data
        return this.prisma.transaksiPembelian.create({ data: newData });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.TransaksiPembelianSelect;
        cursor?: Prisma.TransaksiPembelianWhereUniqueInput;
        where?: Prisma.TransaksiPembelianWhereInput;
        orderBy?: Prisma.TransaksiPembelianOrderByWithRelationInput;
    }): Promise<TransaksiPembelian[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.transaksiPembelian.findMany({
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
        select?: Prisma.TransaksiPembelianSelect;
        where: Prisma.TransaksiPembelianWhereUniqueInput;
    }): Promise<TransaksiPembelian | null> {
        const { select, where } = params;
        return this.prisma.transaksiPembelian.findUnique({
            select: { ...this.findOneKeys, ...select },
            where,
        });
    }

    async update(
        where: Prisma.TransaksiPembelianWhereUniqueInput,
        data: any,
    ): Promise<TransaksiPembelian> {
        let updatedData: Prisma.TransaksiPembelianUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.transaksiPembelian.update({
            where,
            data: updatedData,
        });
    }

    async remove(
        where: Prisma.TransaksiPembelianWhereUniqueInput,
    ): Promise<TransaksiPembelian> {
        return this.prisma.transaksiPembelian.delete({ where });
    }
}

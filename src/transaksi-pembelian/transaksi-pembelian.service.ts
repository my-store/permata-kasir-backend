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

    async create(newData: any): Promise<TransaksiPembelian> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        const data: Prisma.TransaksiPembelianCreateInput = {
            ...newData,

            // Parse to integer
            tokoId: parseInt(newData.tokoId),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Save a new data
        return this.prisma.transaksiPembelian.create({ data });
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

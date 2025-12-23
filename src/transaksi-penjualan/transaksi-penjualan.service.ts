import { Prisma, TransaksiPenjualan } from "models";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TransaksiPenjualanService {
    private readonly findAllKeys: Prisma.TransaksiPenjualanSelect = {
        id: true,
        createdAt: true,
        updatedAt: true,
    };

    private readonly findOneKeys: Prisma.TransaksiPenjualanSelect = {
        id: true,
        createdAt: true,
        updatedAt: true,
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(newData: any): Promise<TransaksiPenjualan> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        const data: Prisma.TransaksiPenjualanCreateInput = {
            ...newData,

            // Parse to integer
            tokoId: parseInt(newData.tokoId),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Save a new data
        return this.prisma.transaksiPenjualan.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.TransaksiPenjualanSelect;
        cursor?: Prisma.TransaksiPenjualanWhereUniqueInput;
        where?: Prisma.TransaksiPenjualanWhereInput;
        orderBy?: Prisma.TransaksiPenjualanOrderByWithRelationInput;
    }): Promise<TransaksiPenjualan[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.transaksiPenjualan.findMany({
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
        select?: Prisma.TransaksiPenjualanSelect;
        where: Prisma.TransaksiPenjualanWhereUniqueInput;
    }): Promise<TransaksiPenjualan | null> {
        const { select, where } = params;
        return this.prisma.transaksiPenjualan.findUnique({
            select: { ...this.findOneKeys, ...select },
            where,
        });
    }

    async update(
        where: Prisma.TransaksiPenjualanWhereUniqueInput,
        data: any,
    ): Promise<TransaksiPenjualan> {
        let updatedData: Prisma.TransaksiPenjualanUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.transaksiPenjualan.update({
            where,
            data: updatedData,
        });
    }

    async remove(
        where: Prisma.TransaksiPenjualanWhereUniqueInput,
    ): Promise<TransaksiPenjualan> {
        return this.prisma.transaksiPenjualan.delete({ where });
    }
}

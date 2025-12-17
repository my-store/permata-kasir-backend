import { Prisma, TransaksiPenjualan } from "prisma/generated";
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

    async create(data: any): Promise<TransaksiPenjualan> {
        let newData: Prisma.TransaksiPenjualanCreateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        newData.createdAt = thisTime;
        newData.updatedAt = thisTime;

        // Save a new data
        return this.prisma.transaksiPenjualan.create({ data: newData });
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

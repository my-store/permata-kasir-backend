import { Prisma, TransaksiPembelian } from "models";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.TransaksiPembelianSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    produk: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,
};

@Injectable()
export class TransaksiPembelianService {
    private readonly findAllKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultKeys,

        // Another keys
    };

    private readonly findOneKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultKeys,

        // Another keys
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
        select?: DefaultKeysInterface;
        cursor?: Prisma.TransaksiPembelianWhereUniqueInput;
        where?: Prisma.TransaksiPembelianWhereInput;
        orderBy?: Prisma.TransaksiPembelianOrderByWithRelationInput;
    }): Promise<TransaksiPembelian[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.transaksiPembelian.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: {
                // Default keys to display
                ...this.findAllKeys,

                // User specified keys to display
                ...select,
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.TransaksiPembelianWhereUniqueInput;
    }): Promise<TransaksiPembelian | null> {
        const { select, where } = params;
        return this.prisma.transaksiPembelian.findUnique({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
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

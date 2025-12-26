import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma, Produk } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.ProdukSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    nama: true,
    hargaPokok: true,
    hargaJual: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,

    // Many to Many relations
    diskon: {
        select: {
            id: true,
            keterangan: true,
            nilai: true,
        },
    },
};

@Injectable()
export class ProdukService {
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

    async create(newData: any): Promise<Produk> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // Prepare data
        const data: Prisma.ProdukCreateInput = {
            ...newData,

            // Force parse to integer
            tokoId: parseInt(newData.tokoId),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.produk.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.ProdukWhereUniqueInput;
        where?: Prisma.ProdukWhereInput;
        orderBy?: Prisma.ProdukOrderByWithRelationInput;
    }): Promise<Produk[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.produk.findMany({
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
        where: Prisma.ProdukWhereUniqueInput;
    }): Promise<Produk | null> {
        const { select, where } = params;
        return this.prisma.produk.findUnique({
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
        where: Prisma.ProdukWhereUniqueInput,
        data: any,
    ): Promise<Produk> {
        let updatedData: Prisma.ProdukUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.produk.update({ where, data: updatedData });
    }

    async remove(where: Prisma.ProdukWhereUniqueInput): Promise<Produk> {
        return this.prisma.produk.delete({ where });
    }
}

import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { Diskon, Prisma } from "models";

@Injectable()
export class DiskonService {
    private readonly findAllKeys: Prisma.DiskonSelect = {
        id: true,
        keterangan: true,
        nilai: true,
        createdAt: true,
        updatedAt: true,
    };

    private readonly findOneKeys: Prisma.DiskonSelect = {
        id: true,
        keterangan: true,
        nilai: true,
        createdAt: true,
        updatedAt: true,

        toko: {
            select: {
                id: true,
                nama: true,
                alamat: true,
            },
        },
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(newData: any): Promise<Diskon> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // Prepare data
        const data: Prisma.DiskonCreateInput = {
            ...newData,

            // Parse to integer
            tokoId: parseInt(newData.tokoId),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.diskon.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.DiskonSelect;
        cursor?: Prisma.DiskonWhereUniqueInput;
        where?: Prisma.DiskonWhereInput;
        orderBy?: Prisma.DiskonOrderByWithRelationInput;
    }): Promise<Diskon[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.diskon.findMany({
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
        select?: Prisma.DiskonSelect;
        where: Prisma.DiskonWhereUniqueInput;
    }): Promise<Diskon | null> {
        const { select, where } = params;
        return this.prisma.diskon.findUnique({
            select: { ...this.findOneKeys, ...select },
            where,
        });
    }

    async update(
        where: Prisma.DiskonWhereUniqueInput,
        data: any,
    ): Promise<Diskon> {
        let updatedData: Prisma.DiskonUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.diskon.update({ where, data: updatedData });
    }

    async remove(where: Prisma.DiskonWhereUniqueInput): Promise<Diskon> {
        return this.prisma.diskon.delete({ where });
    }
}

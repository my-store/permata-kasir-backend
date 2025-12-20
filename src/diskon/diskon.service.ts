import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { Diskon, Prisma } from "models";

@Injectable()
export class DiskonService {
    private readonly findAllKeys: Prisma.DiskonSelect = {
        id: true,
        keterangan: true,
        createdAt: true,
        updatedAt: true,
    };

    private readonly findOneKeys: Prisma.DiskonSelect = {
        id: true,
        keterangan: true,
        createdAt: true,
        updatedAt: true,
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(data: any): Promise<Diskon> {
        let newData: Prisma.DiskonCreateInput = {
            ...data,

            // Parse to integer
            tokoId: parseInt(data.tokoId),
        };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        newData.createdAt = thisTime;
        newData.updatedAt = thisTime;

        // Save a new data
        return this.prisma.diskon.create({ data: newData });
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

import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { MemberRanking, Prisma } from "models";

@Injectable()
export class MemberRankingService {
    private readonly findAllKeys: Prisma.MemberRankingSelect = {
        id: true,
        nama: true,
        potonganBelanja: true,
        createdAt: true,
        updatedAt: true,
    };

    private readonly findOneKeys: Prisma.MemberRankingSelect = {
        id: true,
        nama: true,
        potonganBelanja: true,
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

    async create(newData: any): Promise<MemberRanking> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // Prepare data
        const data: Prisma.MemberRankingCreateInput = {
            ...newData,

            // Parse to integer
            tokoId: parseInt(newData.tokoId),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.memberRanking.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.MemberRankingSelect;
        cursor?: Prisma.MemberRankingWhereUniqueInput;
        where?: Prisma.MemberRankingWhereInput;
        orderBy?: Prisma.MemberRankingOrderByWithRelationInput;
    }): Promise<MemberRanking[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.memberRanking.findMany({
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
        select?: Prisma.MemberRankingSelect;
        where: Prisma.MemberRankingWhereUniqueInput;
    }): Promise<MemberRanking | null> {
        const { select, where } = params;
        return this.prisma.memberRanking.findUnique({
            select: { ...this.findOneKeys, ...select },
            where,
        });
    }

    async update(
        where: Prisma.MemberRankingWhereUniqueInput,
        data: any,
    ): Promise<MemberRanking> {
        let updatedData: Prisma.MemberRankingUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.memberRanking.update({ where, data: updatedData });
    }

    async remove(
        where: Prisma.MemberRankingWhereUniqueInput,
    ): Promise<MemberRanking> {
        return this.prisma.memberRanking.delete({ where });
    }
}

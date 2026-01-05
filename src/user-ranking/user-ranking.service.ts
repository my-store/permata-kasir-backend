import { Prisma, UserRanking } from "models/client";
import { PrismaService } from "../prisma.service";
import { generateId } from "src/libs/string";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.UserRankingSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    uuid: true,
    nama: true,
    maxToko: true,
    maxProduk: true,
    maxJasa: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data
    adminId: true,
};

@Injectable()
export class UserRankingService {
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

    cleanUpdateData(d: any): any {
        const {
            // Disabled data to be updated
            id,
            uuid,
            adminId,
            createdAt,
            updatedAt,

            // Update - 1 January 2026
            admin,

            // Fixed | Now data update will be save
            ...cleanedData
        }: any = d;
        return cleanedData;
    }

    async create(newData: any): Promise<UserRanking> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.userRanking.findUniqueOrThrow({
                where: { uuid },
            });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Prepare data
        let data: Prisma.UserRankingCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.userRanking.create({
            data,
            select: this.findOneKeys,
        });
    }

    async update(
        where: Prisma.UserRankingWhereUniqueInput,
        data: any,
    ): Promise<UserRanking> {
        let updatedData: Prisma.UserRankingUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.userRanking.update({
            where,
            data: updatedData,
            select: this.findOneKeys,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserRankingWhereUniqueInput;
        where?: Prisma.UserRankingWhereInput;
        orderBy?: Prisma.UserRankingOrderByWithRelationInput;
        select?: DefaultKeysInterface;
    }): Promise<UserRanking[]> {
        const { skip, take, cursor, where, orderBy, select } = params;
        return this.prisma.userRanking.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: {
                // Default keys to display
                ...this.findAllKeys,

                // User-ranking specified keys to display
                ...select,
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.UserRankingWhereUniqueInput;
    }): Promise<UserRanking | null> {
        const { select, where } = params;
        return this.prisma.userRanking.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User-Ranking specified keys to display
                ...select,
            },
            where,
        });
    }

    async remove(
        where: Prisma.UserRankingWhereUniqueInput,
    ): Promise<UserRanking> {
        return this.prisma.userRanking.delete({
            where,
            select: this.findOneKeys,
        });
    }
}

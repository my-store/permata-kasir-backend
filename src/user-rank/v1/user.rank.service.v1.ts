import { Prisma, UserRank } from "models/client";
import { PrismaService } from "../../prisma.service";
import { generateId } from "src/libs/string";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.UserRankSelect {}

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
export class UserRankServiceV1 {
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

    async create(newData: any): Promise<UserRank> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuidLength: any = process.env.USER_RANK_INSERT_UUID_LENGTH;
        const uuid: string = generateId(parseInt(uuidLength));

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.userRank.findUniqueOrThrow({
                where: { uuid },
            });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Prepare data
        let data: Prisma.UserRankCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.userRank.create({
            data,
            select: this.findOneKeys,
        });
    }

    async update(
        where: Prisma.UserRankWhereUniqueInput,
        data: any,
    ): Promise<UserRank> {
        let updatedData: Prisma.UserRankUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.userRank.update({
            where,
            data: updatedData,
            select: this.findOneKeys,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserRankWhereUniqueInput;
        where?: Prisma.UserRankWhereInput;
        orderBy?: Prisma.UserRankOrderByWithRelationInput;
        select?: DefaultKeysInterface;
    }): Promise<UserRank[]> {
        const { skip, take, cursor, where, orderBy, select } = params;
        return this.prisma.userRank.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            select: {
                // Default keys to display
                ...this.findAllKeys,

                // User-rank specified keys to display
                ...select,
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.UserRankWhereUniqueInput;
    }): Promise<UserRank | null> {
        const { select, where } = params;
        return this.prisma.userRank.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User-Rank specified keys to display
                ...select,
            },
            where,
        });
    }

    async remove(where: Prisma.UserRankWhereUniqueInput): Promise<UserRank> {
        return this.prisma.userRank.delete({
            where,
            select: this.findOneKeys,
        });
    }
}

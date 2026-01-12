import { generateId, getTimestamp } from "src/libs/string";
import { PrismaService } from "../../prisma.service";
import { Prisma, UserRank } from "models/client";
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
        const thisTime = getTimestamp();

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

        // Insert data
        return this.prisma.userRank.create({
            data: {
                ...newData,

                // UUID
                uuid,

                // Timestamp
                createdAt: thisTime,
                updatedAt: thisTime,
            },
            // Fields to display after creation
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
        return this.prisma.userRank.findMany({
            ...params,
            select: {
                ...this.findAllKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.UserRankWhereUniqueInput;
    }): Promise<UserRank | null> {
        return this.prisma.userRank.findUniqueOrThrow({
            ...params,
            select: {
                ...this.findOneKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async update(
        where: Prisma.UserRankWhereUniqueInput,
        data: any,
    ): Promise<UserRank> {
        return this.prisma.userRank.update({
            where,
            data: {
                ...data,

                // Timestamp
                updatedAt: getTimestamp(),
            },
            // Fields to display after update data
            select: this.findOneKeys,
        });
    }

    async remove(where: Prisma.UserRankWhereUniqueInput): Promise<UserRank> {
        return this.prisma.userRank.delete({
            where,
            select: this.findOneKeys,
        });
    }
}

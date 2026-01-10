import { defaultUserKeys } from "./user.service.v1";
import { Prisma, UserRefreshToken } from "models";
import { PrismaService } from "src/prisma.service";
import { getTimestamp } from "src/libs/string";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRefreshTokenServiceV1 {
    // FIND ALL REFRESH-TOKEN DATA - DISPLAYED KEYS
    private readonly findAllKeys: Prisma.UserRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,

        // User keys
        user: {
            // Only show some keys
            select: {
                nama: true,
                online: true,
            },
        },
    };

    // FIND ONE REFRESH-TOKEN DATA - DISPLAYED KEYS
    private readonly findOneKeys: Prisma.UserRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,

        // User keys
        user: {
            // Show all keys
            select: defaultUserKeys,
        },
    };

    constructor(private readonly prisma: PrismaService) {}

    async update(
        where: Prisma.UserRefreshTokenWhereUniqueInput,
        data: any,
    ): Promise<UserRefreshToken> {
        let updatedData: Prisma.UserRefreshTokenUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.userRefreshToken.update({
            where,
            data: updatedData,
            select: this.findOneKeys,
        });
    }

    async remove(
        where: Prisma.UserRefreshTokenWhereUniqueInput,
    ): Promise<UserRefreshToken> {
        return this.prisma.userRefreshToken.delete({
            where,
            select: this.findOneKeys,
        });
    }

    async removeMany(ids: number[]): Promise<Prisma.BatchPayload> {
        return this.prisma.userRefreshToken.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    async create(tlp: string, newData: any): Promise<UserRefreshToken> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        const data: Prisma.UserRefreshTokenCreateInput = {
            ...newData,

            // Pastikan user masih ada (untuk keamanan)
            user: {
                connect: {
                    tlp,
                },
            },

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        return this.prisma.userRefreshToken.create({
            data,
            select: {
                // Default keys to display
                ...this.findOneKeys,
            },
        });
    }

    async findOne(params: {
        select?: Prisma.UserRefreshTokenSelect;
        where: Prisma.UserRefreshTokenWhereUniqueInput;
    }): Promise<UserRefreshToken> {
        const { select, where } = params;
        return this.prisma.userRefreshToken.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.UserRefreshTokenSelect;
        cursor?: Prisma.UserRefreshTokenWhereUniqueInput;
        where?: Prisma.UserRefreshTokenWhereInput;
        orderBy?: Prisma.UserRefreshTokenOrderByWithRelationInput;
    }): Promise<UserRefreshToken[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.userRefreshToken.findMany({
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
}

import { defaultKasirKeys } from "./kasir.service.v1";
import { Prisma, KasirRefreshToken } from "models";
import { PrismaService } from "src/prisma.service";
import { getTimestamp } from "src/libs/string";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KasirRefreshTokenServiceV1 {
    // FIND ALL REFRESH-TOKEN DATA - DISPLAYED KEYS
    private readonly findAllKeys: Prisma.KasirRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,

        // Kasir keys
        kasir: {
            // Only show some keys
            select: {
                nama: true,
                online: true,
            },
        },
    };

    // FIND ONE REFRESH-TOKEN DATA - DISPLAYED KEYS
    private readonly findOneKeys: Prisma.KasirRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,

        // Kasir keys
        kasir: {
            // Show all keys
            select: defaultKasirKeys,
        },
    };

    constructor(private readonly prisma: PrismaService) {}

    async update(
        where: Prisma.KasirRefreshTokenWhereUniqueInput,
        data: any,
    ): Promise<KasirRefreshToken> {
        let updatedData: Prisma.KasirRefreshTokenUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.kasirRefreshToken.update({
            where,
            data: updatedData,
            select: this.findOneKeys,
        });
    }

    async remove(
        where: Prisma.KasirRefreshTokenWhereUniqueInput,
    ): Promise<KasirRefreshToken> {
        return this.prisma.kasirRefreshToken.delete({
            where,
            select: this.findOneKeys,
        });
    }

    async removeMany(ids: number[]): Promise<Prisma.BatchPayload> {
        return this.prisma.kasirRefreshToken.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    async create(tlp: string, newData: any): Promise<KasirRefreshToken> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        const data: Prisma.KasirRefreshTokenCreateInput = {
            ...newData,

            // Pastikan kasir masih ada (untuk keamanan)
            kasir: {
                connect: {
                    tlp,
                },
            },

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        return this.prisma.kasirRefreshToken.create({
            data,
            select: {
                // Default keys to display
                ...this.findOneKeys,
            },
        });
    }

    async findOne(params: {
        select?: Prisma.KasirRefreshTokenSelect;
        where: Prisma.KasirRefreshTokenWhereUniqueInput;
    }): Promise<KasirRefreshToken> {
        const { select, where } = params;
        return this.prisma.kasirRefreshToken.findUniqueOrThrow({
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
        select?: Prisma.KasirRefreshTokenSelect;
        cursor?: Prisma.KasirRefreshTokenWhereUniqueInput;
        where?: Prisma.KasirRefreshTokenWhereInput;
        orderBy?: Prisma.KasirRefreshTokenOrderByWithRelationInput;
    }): Promise<KasirRefreshToken[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.kasirRefreshToken.findMany({
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

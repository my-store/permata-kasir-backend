import { defaultAdminKeys } from "./admin.service.v1";
import { Prisma, AdminRefreshToken } from "models";
import { PrismaService } from "src/prisma.service";
import { getTimestamp } from "src/libs/string";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminRefreshTokenServiceV1 {
    // FIND ALL REFRESH-TOKEN DATA - DISPLAYED KEYS
    private readonly findAllKeys: Prisma.AdminRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,

        // Admin keys
        admin: {
            // Only show some keys
            select: {
                nama: true,
                online: true,
            },
        },
    };

    // FIND ONE REFRESH-TOKEN DATA - DISPLAYED KEYS
    private readonly findOneKeys: Prisma.AdminRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,

        // Admin keys
        admin: {
            // Show all keys
            select: defaultAdminKeys,
        },
    };

    constructor(private readonly prisma: PrismaService) {}

    async update(
        where: Prisma.AdminRefreshTokenWhereUniqueInput,
        data: any,
    ): Promise<AdminRefreshToken> {
        let updatedData: Prisma.AdminRefreshTokenUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.adminRefreshToken.update({
            where,
            data: updatedData,
            select: this.findOneKeys,
        });
    }

    async remove(
        where: Prisma.AdminRefreshTokenWhereUniqueInput,
    ): Promise<AdminRefreshToken> {
        return this.prisma.adminRefreshToken.delete({
            where,
            select: this.findOneKeys,
        });
    }

    async removeMany(ids: number[]): Promise<Prisma.BatchPayload> {
        return this.prisma.adminRefreshToken.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    async create(tlp: string, newData: any): Promise<AdminRefreshToken> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        const data: Prisma.AdminRefreshTokenCreateInput = {
            ...newData,

            // Pastikan admin masih ada (untuk keamanan)
            admin: {
                connect: {
                    tlp,
                },
            },

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        return this.prisma.adminRefreshToken.create({
            data,
            select: {
                // Default keys to display
                ...this.findOneKeys,
            },
        });
    }

    async findOne(params: {
        select?: Prisma.AdminRefreshTokenSelect;
        where: Prisma.AdminRefreshTokenWhereUniqueInput;
    }): Promise<AdminRefreshToken> {
        const { select, where } = params;
        return this.prisma.adminRefreshToken.findUniqueOrThrow({
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
        select?: Prisma.AdminRefreshTokenSelect;
        cursor?: Prisma.AdminRefreshTokenWhereUniqueInput;
        where?: Prisma.AdminRefreshTokenWhereInput;
        orderBy?: Prisma.AdminRefreshTokenOrderByWithRelationInput;
    }): Promise<AdminRefreshToken[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.adminRefreshToken.findMany({
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

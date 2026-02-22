import { Prisma, KasirRefreshToken } from "models";
import { PrismaService } from "src/prisma.service";
import { getTimestamp } from "src/libs/string";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KasirRefreshTokenServiceV1 {
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
        });
    }

    async remove(
        where: Prisma.KasirRefreshTokenWhereUniqueInput,
    ): Promise<KasirRefreshToken> {
        return this.prisma.kasirRefreshToken.delete({
            where,
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
        });
    }

    async findOne(
        params: Prisma.KasirRefreshTokenFindUniqueOrThrowArgs,
    ): Promise<KasirRefreshToken> {
        return this.prisma.kasirRefreshToken.findUniqueOrThrow(params);
    }

    async findAll(
        params: Prisma.KasirRefreshTokenFindManyArgs,
    ): Promise<KasirRefreshToken[]> {
        return this.prisma.kasirRefreshToken.findMany(params);
    }
}

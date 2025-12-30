import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { MemberRanking, Prisma } from "models";
import { generateId } from "src/libs/string";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.MemberRankingSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    uuid: true,
    nama: true,
    potonganBelanja: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,
};

@Injectable()
export class MemberRankingService {
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

    async ownerCheck(params: {
        sub: string;
        role: string;
        userId: number;
        tokoId: number;
    }): Promise<any> {
        const { role, sub, userId, tokoId } = params;

        // Bypass this security for admin (developer)
        if (role == "Admin") {
            return;
        }

        // Cari data toko
        const toko: any = await this.prisma.toko.findUniqueOrThrow({
            where: { id: tokoId },
            select: {
                user: {
                    select: {
                        id: true,
                        tlp: true,
                    },
                },
            },
        });

        // Pastikan yang mengirimkan request ini adalah pemilik toko
        if (toko.user.id != userId || toko.user.tlp != sub) {
            // Jika bukan, blokir request.
            throw new UnauthorizedException();
        }
    }

    async create(newData: any): Promise<MemberRanking> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.memberRanking.findUniqueOrThrow({
                where: { uuid },
            });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Prepare data
        const data: Prisma.MemberRankingCreateInput = {
            ...newData,

            // UUID
            uuid,

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
        select?: DefaultKeysInterface;
        cursor?: Prisma.MemberRankingWhereUniqueInput;
        where?: Prisma.MemberRankingWhereInput;
        orderBy?: Prisma.MemberRankingOrderByWithRelationInput;
    }): Promise<MemberRanking[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.memberRanking.findMany({
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

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.MemberRankingWhereUniqueInput;
    }): Promise<MemberRanking | null> {
        const { select, where } = params;
        return this.prisma.memberRanking.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
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

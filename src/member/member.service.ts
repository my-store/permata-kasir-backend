import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { Member, Prisma } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.MemberSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    nama: true,
    alamat: true,
    tlp: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,
    memberRankingId: true,
};

@Injectable()
export class MemberService {
    private readonly findAllKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultKeys,

        // Another keys
    };

    private readonly findOneKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultKeys,

        // Another keys
        toko: {
            select: {
                nama: true,
                alamat: true,
                createdAt: true,
                updatedAt: true,

                user: {
                    select: {
                        id: true,
                        nama: true,
                        alamat: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        },

        memberRanking: {
            select: {
                nama: true,
                potonganBelanja: true,
            },
        },
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(newData: any): Promise<Member> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        const data: Prisma.MemberCreateInput = {
            ...newData,

            // Parse to integer
            tokoId: parseInt(newData.tokoId),
            memberRankingId: parseInt(newData.memberRankingId) ?? null,

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.member.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.MemberWhereUniqueInput;
        where?: Prisma.MemberWhereInput;
        orderBy?: Prisma.MemberOrderByWithRelationInput;
    }): Promise<Member[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.member.findMany({
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
        where: Prisma.MemberWhereUniqueInput;
    }): Promise<Member | null> {
        const { select, where } = params;
        return this.prisma.member.findUnique({
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
        where: Prisma.MemberWhereUniqueInput,
        data: any,
    ): Promise<Member> {
        let updatedData: Prisma.MemberUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.member.update({ where, data: updatedData });
    }

    async remove(where: Prisma.MemberWhereUniqueInput): Promise<Member> {
        return this.prisma.member.delete({ where });
    }
}

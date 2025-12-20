import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";
import { Member, Prisma } from "models";

@Injectable()
export class MemberService {
    private readonly findAllKeys: Prisma.MemberSelect = {
        id: true,
        createdAt: true,
        updatedAt: true,
    };

    private readonly findOneKeys: Prisma.MemberSelect = {
        id: true,
        createdAt: true,
        updatedAt: true,
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(data: any): Promise<Member> {
        let newData: Prisma.MemberCreateInput = {
            ...data,

            // Parse to integer
            tokoId: parseInt(data.tokoId),
            memberRankingId: data.memberRankingId ?? null,
        };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        newData.createdAt = thisTime;
        newData.updatedAt = thisTime;

        // Save a new data
        return this.prisma.member.create({ data: newData });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: Prisma.MemberSelect;
        cursor?: Prisma.MemberWhereUniqueInput;
        where?: Prisma.MemberWhereInput;
        orderBy?: Prisma.MemberOrderByWithRelationInput;
    }): Promise<Member[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.member.findMany({
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
        select?: Prisma.MemberSelect;
        where: Prisma.MemberWhereUniqueInput;
    }): Promise<Member | null> {
        const { select, where } = params;
        return this.prisma.member.findUnique({
            select: { ...this.findOneKeys, ...select },
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

import { PrismaService } from "src/prisma.service";
import { generateId } from "src/libs/string";
import { Injectable } from "@nestjs/common";
import { Member, Prisma } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.MemberSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    uuid: true,
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

        // Cari data toko, pastikan pemiliknya adalah yang sekarang mengirim request.
        return this.prisma.toko.findUniqueOrThrow({
            where: {
                id: tokoId,

                // Pastikan user pengirim request ini adalah pemilik toko
                user: {
                    id: userId,
                    tlp: sub,
                },
            },
        });
    }

    async create(newData: any): Promise<Member> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.member.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        const data: Prisma.MemberCreateInput = {
            ...newData,

            // UUID
            uuid,

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
        return this.prisma.member.findUniqueOrThrow({
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

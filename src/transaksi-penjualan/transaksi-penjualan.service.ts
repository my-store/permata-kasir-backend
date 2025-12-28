import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma, TransaksiPenjualan } from "models";
import { PrismaService } from "src/prisma.service";
import { generateId } from "src/libs/string";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.TransaksiPenjualanSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    produk: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,
};

@Injectable()
export class TransaksiPenjualanService {
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
        const toko: any = await this.prisma.toko.findUnique({
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

    async create(newData: any): Promise<TransaksiPenjualan> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.transaksiPenjualan.findUniqueOrThrow({
                where: { uuid },
            });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        const data: Prisma.TransaksiPenjualanCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Parse to integer
            tokoId: parseInt(newData.tokoId),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Save a new data
        return this.prisma.transaksiPenjualan.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.TransaksiPenjualanWhereUniqueInput;
        where?: Prisma.TransaksiPenjualanWhereInput;
        orderBy?: Prisma.TransaksiPenjualanOrderByWithRelationInput;
    }): Promise<TransaksiPenjualan[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.transaksiPenjualan.findMany({
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
        where: Prisma.TransaksiPenjualanWhereUniqueInput;
    }): Promise<TransaksiPenjualan | null> {
        const { select, where } = params;
        return this.prisma.transaksiPenjualan.findUnique({
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
        where: Prisma.TransaksiPenjualanWhereUniqueInput,
        data: any,
    ): Promise<TransaksiPenjualan> {
        let updatedData: Prisma.TransaksiPenjualanUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.transaksiPenjualan.update({
            where,
            data: updatedData,
        });
    }

    async remove(
        where: Prisma.TransaksiPenjualanWhereUniqueInput,
    ): Promise<TransaksiPenjualan> {
        return this.prisma.transaksiPenjualan.delete({ where });
    }
}

import { generateId, getTimestamp } from "src/libs/string";
import { Prisma, Kasir, KasirRefreshToken } from "models";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.KasirSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    uuid: true,
    nama: true,
    tlp: true,
    password: true,
    foto: true,
    online: true,
    lastOnline: true,
    active: true,
    deactivatedAt: true,
    deactivatedReason: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,
};

@Injectable()
export class KasirServiceV1 {
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

    // Refresh Token Keys
    private readonly refreshTokenKeys: Prisma.KasirRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,
    };

    constructor(private readonly prisma: PrismaService) {}

    /* -----------------------------------------------------
    |  SECURE DATABASE QUERIES
    |  -----------------------------------------------------
    |  Method ini dapat digunkan untuk mengambil, merubah
    |  dan menghapus data.
    */
    secureQueries(params: {
        queries: any;
        headers: {
            sub: string;
            role: string;
        };
    }): any {
        const {
            queries,
            headers: { sub, role },
        } = params;

        // Query database sebelum di modifikasi
        let qx: any = { ...queries };

        /* -----------------------------------------------------
        |  POSES MODIFIKASI WHERE STATEMENT | USER ONLY
        |  -----------------------------------------------------
        */
        if (role != "Admin") {
            // Melakukan modifikasi pada where statement
            qx["where"] = {
                /* -----------------------------------------------------
                |  USER WHERE STATEMENTS
                |  -----------------------------------------------------
                |  Where statement yang dikirim user
                */
                ...qx["where"],

                /* -----------------------------------------------------
                |  OVERRIDE USER WHERE STATEMENTS
                |  -----------------------------------------------------
                |  Hanya menampilkan atau memodifikasi data kasir
                |  sesuai dengan toko yang user miliki,
                |  jika user memiliki banyak toko, akan menampilkan
                |  seluruh kasir dari toko-toko tersebut.
                */
                toko: {
                    user: {
                        tlp: sub,
                    },
                },
            };
        }

        return qx;
    }

    /* =====================================================
    |  PENGECEKAN KEPEMILIKAN SAAT INPUT DATA
    |  =====================================================
    |  Hanya admin yang tidak melewati pengecekan ini.
    |  -----------------------------------------------------
    |  Metode pengecekan adalah dengan mencari data toko
    |  yang memiliki informasi:
    |  - User ID sesuai yang dikirim pada request body
    |  - No tlp sesuai yang dikirim pada request header
    |  -----------------------------------------------------
    |  Jika data tidak ditemukan, request input dibatalkan.
    |  -----------------------------------------------------
    |  Method ini hanya untuk pengecekan saat input data.
    */
    async inputOwnerCheck(params: {
        sub: string;
        role: string;
        userId: number;
        tokoId: number;
    }): Promise<any> {
        const {
            // Informasi yang dikirim pada header (dibuat saat login)
            role,
            sub,

            // Informasi yang dikirim bersamaan dengan data
            // yang akan di input, diubah atau dihapus.
            userId,
            tokoId,
        } = params;

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

    cleanUpdateData(d: any): any {
        const {
            // Disabled data to be updated
            id,
            uuid,
            tokoId,
            createdAt,
            updatedAt,

            // Fixed | Now data update will be save
            ...cleanedData
        }: any = d;
        return cleanedData;
    }

    async create(newData: any): Promise<Kasir> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        // UUID
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.kasir.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Prepare data
        const data: Prisma.KasirCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.kasir.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.KasirWhereUniqueInput;
        where?: Prisma.KasirWhereInput;
        orderBy?: Prisma.KasirOrderByWithRelationInput;
    }): Promise<Kasir[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.kasir.findMany({
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
        where: Prisma.KasirWhereUniqueInput;
    }): Promise<Kasir | null> {
        const { select, where } = params;
        return this.prisma.kasir.findUniqueOrThrow({
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
        where: Prisma.KasirWhereUniqueInput,
        data: any,
    ): Promise<Kasir> {
        let updatedData: Prisma.KasirUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.kasir.update({ where, data: updatedData });
    }

    async remove(where: Prisma.KasirWhereUniqueInput): Promise<Kasir> {
        return this.prisma.kasir.delete({ where });
    }

    /* ==============================================================
    |  CREATE A NEW LOGIN TOKEN
    |  ==============================================================
    |  Update 9 January 2026
    |  --------------------------------------------------------------
    |  Membuat refresh-token baru saat login.
    */
    async createToken(tlp: string, newData: any): Promise<KasirRefreshToken> {
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
                ...this.refreshTokenKeys,
            },
        });
    }

    /* ==============================================================
        |  REFRESH TOKEN
        |  ==============================================================
        |  Update 9 January 2026
        |  --------------------------------------------------------------
        |  Mencari token lama sebelum token baru dibuat.
        */
    async findToken(params: {
        select?: Prisma.KasirRefreshTokenSelect;
        where: Prisma.KasirRefreshTokenWhereUniqueInput;
    }): Promise<KasirRefreshToken> {
        const { select, where } = params;
        return this.prisma.kasirRefreshToken.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.refreshTokenKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }
}

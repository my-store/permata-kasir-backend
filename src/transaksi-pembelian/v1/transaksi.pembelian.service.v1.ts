import { generateId, getTimestamp } from "src/libs/string";
import { Prisma, TransaksiPembelian } from "models";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.TransaksiPembelianSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    uuid: true,
    produk: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,
};

@Injectable()
export class TransaksiPembelianServiceV1 {
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
                |  Hanya menampilkan atau memodifikasi data transaksi-pembelian
                |  sesuai dengan toko yang user miliki,
                |  jika user memiliki banyak toko, akan menampilkan
                |  seluruh transaksi-pembelian dari toko-toko tersebut.
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

    cleanInsertData(d: any): any {
        const {
            // Disabled data to be manual inserted
            id,
            uuid,
            createdAt,
            updatedAt,

            // Make sure to remove userId before insert, because that is only
            // for security checking.
            // If not removed, will cause error.
            userId,

            // Fixed | Now data insert will be save
            ...cleanedInsertData
        }: any = d;
        return cleanedInsertData;
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
            ...cleanedUpdateData
        }: any = d;
        return cleanedUpdateData;
    }

    async create(newData: any): Promise<TransaksiPembelian> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        // UUID
        const uuidLength: any =
            process.env.TRANSAKSI_PEMBELIAN_INSERT_UUID_LENGTH;
        const uuid: string = generateId(parseInt(uuidLength));

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.transaksiPembelian.findUniqueOrThrow({
                where: { uuid },
            });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Save a new data
        return this.prisma.transaksiPembelian.create({
            data: {
                ...newData,

                // UUID
                uuid,

                // Timestamp
                createdAt: thisTime,
                updatedAt: thisTime,
            },
            // Fields to display after creation
            select: this.findOneKeys,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.TransaksiPembelianWhereUniqueInput;
        where?: Prisma.TransaksiPembelianWhereInput;
        orderBy?: Prisma.TransaksiPembelianOrderByWithRelationInput;
    }): Promise<TransaksiPembelian[]> {
        return this.prisma.transaksiPembelian.findMany({
            ...params,
            select: {
                ...this.findAllKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.TransaksiPembelianWhereUniqueInput;
    }): Promise<TransaksiPembelian | null> {
        return this.prisma.transaksiPembelian.findUniqueOrThrow({
            ...params,
            select: {
                ...this.findOneKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async update(
        where: Prisma.TransaksiPembelianWhereUniqueInput,
        data: any,
    ): Promise<TransaksiPembelian> {
        return this.prisma.transaksiPembelian.update({
            where,
            data: {
                ...data,

                // Timestamp
                updatedAt: getTimestamp(),
            },
            // Fields to display after update data
            select: this.findOneKeys,
        });
    }

    async remove(
        where: Prisma.TransaksiPembelianWhereUniqueInput,
    ): Promise<TransaksiPembelian> {
        return this.prisma.transaksiPembelian.delete({
            where,
            select: this.findOneKeys,
        });
    }
}

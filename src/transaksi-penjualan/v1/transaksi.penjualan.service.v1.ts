import { Prisma, TransaksiPenjualan } from "models";
import { PrismaService } from "src/prisma.service";
import { generateId } from "src/libs/string";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.TransaksiPenjualanSelect {}

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
export class TransaksiPenjualanServiceV1 {
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
                |  Hanya menampilkan atau memodifikasi data transaksi-penjualan
                |  sesuai dengan toko yang user miliki,
                |  jika user memiliki banyak toko, akan menampilkan
                |  seluruh transaksi-penjualan dari toko-toko tersebut.
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

    async create(newData: any): Promise<TransaksiPenjualan> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuidLength: any =
            process.env.TRANSAKSI_PENJUALAN_INSERT_UUID_LENGTH;
        const uuid: string = generateId(parseInt(uuidLength));

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
        return this.prisma.transaksiPenjualan.findUniqueOrThrow({
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

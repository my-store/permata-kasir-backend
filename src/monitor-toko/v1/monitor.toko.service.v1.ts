import { PrismaService } from "src/prisma.service";
import { Prisma, MonitorToko } from "models";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.MonitorTokoSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    username: true,
    password: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,
};

@Injectable()
export class MonitorTokoServiceV1 {
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
                |  Hanya menampilkan atau memodifikasi data monitor-toko
                |  sesuai dengan toko yang user miliki,
                |  jika user memiliki banyak toko, akan menampilkan
                |  seluruh monitor-toko dari toko-toko tersebut.
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

    async create(newData: any): Promise<MonitorToko> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // Prepare data
        const data: Prisma.MonitorTokoCreateInput = {
            ...newData,

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.monitorToko.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.MonitorTokoWhereUniqueInput;
        where?: Prisma.MonitorTokoWhereInput;
        orderBy?: Prisma.MonitorTokoOrderByWithRelationInput;
    }): Promise<MonitorToko[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.monitorToko.findMany({
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
        where: Prisma.MonitorTokoWhereUniqueInput;
    }): Promise<MonitorToko | null> {
        const { select, where } = params;
        return this.prisma.monitorToko.findUniqueOrThrow({
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
        where: Prisma.MonitorTokoWhereUniqueInput,
        data: any,
    ): Promise<MonitorToko> {
        let updatedData: Prisma.MonitorTokoUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.monitorToko.update({ where, data: updatedData });
    }

    async remove(
        where: Prisma.MonitorTokoWhereUniqueInput,
    ): Promise<MonitorToko> {
        return this.prisma.monitorToko.delete({ where });
    }
}

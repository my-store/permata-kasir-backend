import { PrismaService } from "src/prisma.service";
import { generateId } from "src/libs/string";
import { Injectable } from "@nestjs/common";
import { Prisma, Jasa } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.JasaSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    uuid: true,
    nama: true,
    biaya: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    tokoId: true,

    // Many to Many relations
    diskon: {
        select: {
            id: true,
            keterangan: true,
            nilai: true,
        },
    },
};

@Injectable()
export class JasaServiceV1 {
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
                |  Hanya menampilkan atau memodifikasi data jasa
                |  sesuai dengan toko yang user miliki,
                |  jika user memiliki banyak toko, akan menampilkan
                |  seluruh jasa dari toko-toko tersebut.
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

    async create(newData: any): Promise<Jasa> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.jasa.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Prepare data
        const data: Prisma.JasaCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.jasa.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.JasaWhereUniqueInput;
        where?: Prisma.JasaWhereInput;
        orderBy?: Prisma.JasaOrderByWithRelationInput;
    }): Promise<Jasa[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.jasa.findMany({
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
        where: Prisma.JasaWhereUniqueInput;
    }): Promise<Jasa | null> {
        const { select, where } = params;
        return this.prisma.jasa.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }

    async update(where: Prisma.JasaWhereUniqueInput, data: any): Promise<Jasa> {
        let updatedData: Prisma.JasaUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.jasa.update({ where, data: updatedData });
    }

    async remove(where: Prisma.JasaWhereUniqueInput): Promise<Jasa> {
        return this.prisma.jasa.delete({ where });
    }
}

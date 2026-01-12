import { generateId, getTimestamp } from "src/libs/string";
import { Toko, Prisma, User, UserRank } from "models";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.TokoSelect {}

export interface InputOwnerCheckInterface {
    status: boolean;
    paid?: boolean;
}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    uuid: true,
    nama: true,
    alamat: true,
    tlp: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data keys
    userId: true,
};

@Injectable()
export class TokoServiceV1 {
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
                |  Hanya menampilkan atau memodifikasi data toko
                |  sesuai yang user miliki.
                */
                user: {
                    tlp: sub,
                },
            };
        }

        return qx;
    }

    async inputOwnerCheck(params: {
        sub: string;
        role: string;
        userId: number;
    }): Promise<InputOwnerCheckInterface> {
        const { role, sub, userId } = params;

        // Bypass this security for admin (developer)
        if (role == "Admin") {
            return { status: true };
        }

        // Ambil data user
        const user: User = await this.prisma.user.findUniqueOrThrow({
            // Antara tlp login dengan ID yang di inputkan harus saling terhubung
            // untuk memastikan kepemilikan.
            where: {
                // Nomor tlp pada data login
                tlp: sub,

                // ID user yang di inputkan
                id: userId,
            },
        });

        // Ambil data user-rank
        const userRank: UserRank = await this.prisma.userRank.findUniqueOrThrow(
            {
                where: { id: user.userRankId },
            },
        );

        // Ambil data toko
        const toko: Toko[] = await this.findAll({ where: { userId } });

        return {
            status: toko.length < userRank.maxToko,

            // User gratis hanya boleh memiliki 1 toko
            paid: userRank.maxToko > 1,
        };
    }

    cleanInsertData(d: any): any {
        const {
            // Disabled data to be manual inserted
            id,
            uuid,
            createdAt,
            updatedAt,

            // Other fields... (soon)

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
            userId,
            createdAt,
            updatedAt,

            // Fixed | Now data update will be save
            ...cleanedUpdateData
        } = d;
        return cleanedUpdateData;
    }

    async create(newData: any): Promise<Toko> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        // UUID
        const uuidLength: any = process.env.TOKO_INSERT_UUID_LENGTH;
        const uuid: string = generateId(parseInt(uuidLength));

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.toko.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Insert data
        return this.prisma.toko.create({
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
        cursor?: Prisma.TokoWhereUniqueInput;
        where?: Prisma.TokoWhereInput;
        orderBy?: Prisma.TokoOrderByWithRelationInput;
    }): Promise<Toko[]> {
        return this.prisma.toko.findMany({
            ...params,
            select: {
                ...this.findAllKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.TokoWhereUniqueInput;
    }): Promise<Toko | null> {
        return this.prisma.toko.findUniqueOrThrow({
            ...params,
            select: {
                ...this.findOneKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async update(where: Prisma.TokoWhereUniqueInput, data: any): Promise<Toko> {
        return this.prisma.toko.update({
            where,
            data: {
                ...data,

                // Timestamp
                updatedAt: getTimestamp(),
            },
        });
    }

    async remove(where: Prisma.TokoWhereUniqueInput): Promise<Toko> {
        return this.prisma.toko.delete({ where, select: this.findOneKeys });
    }
}

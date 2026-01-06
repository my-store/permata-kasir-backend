import { Toko, Prisma, User, UserRanking } from "models";
import { PrismaService } from "src/prisma.service";
import { generateId } from "src/libs/string";
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
export class TokoService {
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

        // Ambil data user-ranking
        const userRanking: UserRanking =
            await this.prisma.userRanking.findUniqueOrThrow({
                where: { id: user.userRankingId },
            });

        // Ambil data toko
        const toko: Toko[] = await this.findAll({ where: { userId } });

        return {
            status: toko.length < userRanking.maxToko,

            // User gratis hanya boleh memiliki 1 toko
            paid: userRanking.maxToko > 1,
        };
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
            ...cleanedData
        } = d;
        return cleanedData;
    }

    async create(newData: any): Promise<Toko> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // UUID
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.toko.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Prepare data
        const data: Prisma.TokoCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.toko.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.TokoWhereUniqueInput;
        where?: Prisma.TokoWhereInput;
        orderBy?: Prisma.TokoOrderByWithRelationInput;
    }): Promise<Toko[]> {
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.toko.findMany({
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
        where: Prisma.TokoWhereUniqueInput;
    }): Promise<Toko | null> {
        const { select, where } = params;
        return this.prisma.toko.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }

    async update(where: Prisma.TokoWhereUniqueInput, data: any): Promise<Toko> {
        return this.prisma.toko.update({
            where,
            data: {
                ...data,

                // Update timestamp
                updatedAt: new Date().toISOString(),
            },
        });
    }

    async remove(where: Prisma.TokoWhereUniqueInput): Promise<Toko> {
        return this.prisma.toko.delete({ where });
    }
}

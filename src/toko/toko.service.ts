import { PrismaService } from "src/prisma.service";
import { generateId } from "src/libs/string";
import { Injectable } from "@nestjs/common";
import { Toko, Prisma } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.TokoSelect {}

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

    async inputOwnerCheck(params: {
        sub: string;
        role: string;
        userId: number;
    }): Promise<any> {
        const { role, sub, userId } = params;

        // Bypass this security for admin (developer)
        if (role == "Admin") {
            return;
        }

        // Cari data user
        return this.prisma.user.findUniqueOrThrow({
            // Antara tlp login dengan ID yang di inputkan harus saling terhubung
            // untuk memastikan kepemilikan.
            where: {
                // Nomor tlp pada data login
                tlp: sub,

                // ID user yang di inputkan
                id: userId,
            },
        });
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

    async update(params: {
        where: Prisma.TokoWhereUniqueInput;
        data: any;
    }): Promise<Toko> {
        const { where, data } = params;
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

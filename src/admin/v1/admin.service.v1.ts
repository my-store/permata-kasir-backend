import { generateId, getTimestamp } from "src/libs/string";
import { PrismaService } from "src/prisma.service";
import { encryptPassword } from "src/libs/bcrypt";
import { Injectable } from "@nestjs/common";
import { Admin, Prisma } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.AdminSelect {}

export const defaultAdminKeys: DefaultKeysInterface = {
    id: true,
    nama: true,
    uuid: true,
    tlp: true,
    foto: true,
    online: true,
    lastOnline: true,
    createdAt: true,
    updatedAt: true,
};

@Injectable()
export class AdminServiceV1 {
    // FIND ALL ADMIN DATA - DISPLAYED KEYS
    private readonly findAllKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultAdminKeys,

        // Another keys
    };

    // FIND ONE ADMIN DATA - DISPLAYED KEYS
    private readonly findOneKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultAdminKeys,

        // Another keys
        password: true,
    };

    constructor(private readonly prisma: PrismaService) {}

    cleanUpdateData(d: any): any {
        const {
            // Disabled data to be updated
            id,
            uuid,
            createdAt,
            updatedAt,

            // Fixed | Now data update will be save
            ...cleanedUpdateData
        }: any = d;
        return cleanedUpdateData;
    }

    async create(newData: any): Promise<Admin> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        // UUID
        const uuidLength: any = process.env.ADMIN_INSERT_UUID_LENGTH;
        const uuid: string = generateId(parseInt(uuidLength));

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.admin.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Insert data
        return this.prisma.admin.create({
            data: {
                ...newData,

                // UUID
                uuid,

                // Enkripsi password
                password: encryptPassword(newData.password),

                // Timestamp
                createdAt: thisTime,
                updatedAt: thisTime,
            },
            // Fields to display after creation
            select: this.findOneKeys,
        });
    }

    async update(
        where: Prisma.AdminWhereUniqueInput,
        data: any,
    ): Promise<Admin> {
        return this.prisma.admin.update({
            where,
            data: {
                ...data,

                // Timestamp
                updatedAt: getTimestamp(),
            },
            select: this.findOneKeys, // Default keys to display
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        select?: DefaultKeysInterface;
        cursor?: Prisma.AdminWhereUniqueInput;
        where?: Prisma.AdminWhereInput;
        orderBy?: Prisma.AdminOrderByWithRelationInput;
    }): Promise<Admin[]> {
        return this.prisma.admin.findMany({
            ...params,
            select: {
                ...this.findAllKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.AdminWhereUniqueInput;
    }): Promise<Admin | null> {
        return this.prisma.admin.findUniqueOrThrow({
            ...params,
            select: {
                ...this.findOneKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async remove(where: Prisma.AdminWhereUniqueInput): Promise<Admin> {
        return this.prisma.admin.delete({ where, select: this.findOneKeys });
    }
}

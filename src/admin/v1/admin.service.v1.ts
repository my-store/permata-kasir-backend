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

    // FIND ALL REFRESH-TOKEN DATA - DISPLAYED KEYS
    private readonly findAllRTKeys: Prisma.AdminRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,

        // Admin keys
        admin: {
            // Only show some keys
            select: {
                nama: true,
                online: true,
            },
        },
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
            ...cleanedData
        }: any = d;
        return cleanedData;
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

        // Prepare data
        const data: Prisma.AdminCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Enkripsi password
            password: encryptPassword(newData.password),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Insert data
        return this.prisma.admin.create({ data, select: this.findOneKeys });
    }

    async update(
        where: Prisma.AdminWhereUniqueInput,
        data: any,
    ): Promise<Admin> {
        let updatedData: Prisma.AdminUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.admin.update({
            where,
            data: updatedData,
            select: this.findOneKeys,
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
        const { skip, take, select, cursor, where, orderBy } = params;
        return this.prisma.admin.findMany({
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
        where: Prisma.AdminWhereUniqueInput;
    }): Promise<Admin | null> {
        const { select, where } = params;
        return this.prisma.admin.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }

    async remove(where: Prisma.AdminWhereUniqueInput): Promise<Admin> {
        return this.prisma.admin.delete({ where, select: this.findOneKeys });
    }
}

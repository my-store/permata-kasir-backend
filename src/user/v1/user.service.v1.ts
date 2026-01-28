import { generateId, getTimestamp } from "src/libs/string";
import { PrismaService } from "../../prisma.service";
import { encryptPassword } from "../../libs/bcrypt";
import { Injectable } from "@nestjs/common";
import { Prisma, User } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.UserSelect {}

export const defaultUserKeys: DefaultKeysInterface = {
    id: true,
    nama: true,
    uuid: true,
    tlp: true,
    password: true,
    alamat: true,
    foto: true,
    online: true,
    lastOnline: true,
    active: true,
    deactivatedAt: true,
    deactivatedReason: true,
    createdAt: true,
    updatedAt: true,

    // Parent table data
    adminId: true,
    userRankId: true,
};

@Injectable()
export class UserServiceV1 {
    private readonly findAllKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultUserKeys,

        // Another keys
    };

    private readonly findOneKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultUserKeys,

        // Another keys
    };

    constructor(private readonly prisma: PrismaService) {}

    cleanInsertData(d: any): any {
        const {
            // Disabled data to be inserted by user
            id,
            uuid,
            online,
            lastOnline,
            active,
            deactivatedAt,
            deactivatedReason,
            createdAt,
            updatedAt,

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
            adminId,
            createdAt,
            updatedAt,

            // Fixed | Now data update will be save
            ...cleanedUpdateData
        }: any = d;
        return cleanedUpdateData;
    }

    async create(newData: any): Promise<User> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        // UUID
        const uuidLength: any = process.env.USER_INSERT_UUID_LENGTH;
        const uuid: string = generateId(parseInt(uuidLength));

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.user.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Insert data
        return this.prisma.user.create({
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

    async update(where: Prisma.UserWhereUniqueInput, data: any): Promise<User> {
        let updatedData: Prisma.UserUpdateInput = {
            ...data,

            // Timestamp
            updatedAt: getTimestamp(),
        };

        // Fix active value (if client send through FormData body)
        // JSON body dont need this.
        if (updatedData.active) {
            if (typeof updatedData.active == "string") {
                updatedData.active =
                    updatedData.active == "1" || updatedData.active == "true"
                        ? true
                        : false;
            }
        }

        // Save updated data
        return this.prisma.user.update({
            where,
            data: updatedData,
            select: this.findOneKeys,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
        select?: DefaultKeysInterface;
    }): Promise<User[]> {
        return this.prisma.user.findMany({
            ...params,
            select: {
                ...this.findAllKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async findOne(params: {
        select?: DefaultKeysInterface;
        where: Prisma.UserWhereUniqueInput;
    }): Promise<User | null> {
        return this.prisma.user.findUniqueOrThrow({
            ...params,
            select: {
                ...this.findOneKeys, // Default keys to display
                ...params.select, // User specified keys to display
            },
        });
    }

    async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({ where, select: this.findOneKeys });
    }
}

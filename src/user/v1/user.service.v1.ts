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

    cleanUpdateData(d: any): any {
        const {
            // Disabled data to be updated
            id,
            uuid,
            adminId,
            createdAt,
            updatedAt,

            // Fixed | Now data update will be save
            ...cleanedData
        }: any = d;
        return cleanedData;
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

        // Prepare data
        const data: Prisma.UserCreateInput = {
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
        return this.prisma.user.create({ data, select: this.findOneKeys });
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
        const { skip, take, cursor, where, orderBy, select } = params;
        return this.prisma.user.findMany({
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
        where: Prisma.UserWhereUniqueInput;
    }): Promise<User | null> {
        const { select, where } = params;
        return this.prisma.user.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }

    async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({ where, select: this.findOneKeys });
    }
}

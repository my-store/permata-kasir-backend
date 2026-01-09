import { generateId, getTimestamp } from "src/libs/string";
import { Prisma, User, UserRefreshToken } from "models";
import { PrismaService } from "../../prisma.service";
import { encryptPassword } from "../../libs/bcrypt";
import { Injectable } from "@nestjs/common";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.UserSelect {}

const defaultKeys: DefaultKeysInterface = {
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
        ...defaultKeys,

        // Another keys
    };

    private readonly findOneKeys: DefaultKeysInterface = {
        // Default keys
        ...defaultKeys,

        // Another keys
    };

    // Refresh Token Keys
    private readonly refreshTokenKeys: Prisma.UserRefreshTokenSelect = {
        id: true,
        token: true,
        refreshToken: true,
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
        const uuid: string = generateId(10);

        // Pastikan uuid belum pernah digunakan
        try {
            // Jika tidak ditemukan, akan langsung ke input method dibawah
            await this.prisma.user.findUniqueOrThrow({ where: { uuid } });

            // Jika ditemukan, buat ulang uuid dengan memanggil ulang method ini
            return this.create(newData);
        } catch {}

        // Prepare data
        let data: Prisma.UserCreateInput = {
            ...newData,

            // UUID
            uuid,

            // Enkripsi password
            password: encryptPassword(newData.password),

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        // Fix active value (if client send through FormData)
        // JSON form will not need this.
        if (data.active) {
            if (typeof data.active == "string") {
                data.active =
                    data.active == "1" || data.active == "true" ? true : false;
            }
        }

        // Insert data
        return this.prisma.user.create({ data, select: this.findOneKeys });
    }

    async update(where: Prisma.UserWhereUniqueInput, data: any): Promise<User> {
        let updatedData: Prisma.UserUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

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

    /* ==============================================================
    |  CREATE A NEW LOGIN TOKEN
    |  ==============================================================
    |  Update 9 January 2026
    |  --------------------------------------------------------------
    |  Membuat refresh-token baru saat login.
    */
    async createToken(tlp: string, newData: any): Promise<UserRefreshToken> {
        // Konfigurasi timestamp
        const thisTime = getTimestamp();

        const data: Prisma.UserRefreshTokenCreateInput = {
            ...newData,

            // Pastikan user masih ada (untuk keamanan)
            user: {
                connect: {
                    tlp,
                },
            },

            // Timestamp
            createdAt: thisTime,
            updatedAt: thisTime,
        };

        return this.prisma.userRefreshToken.create({
            data,
            select: {
                // Default keys to display
                ...this.refreshTokenKeys,
            },
        });
    }

    /* ==============================================================
    |  REFRESH TOKEN
    |  ==============================================================
    |  Update 9 January 2026
    |  --------------------------------------------------------------
    |  Mencari token lama sebelum token baru dibuat.
    */
    async findToken(params: {
        select?: Prisma.UserRefreshTokenSelect;
        where: Prisma.UserRefreshTokenWhereUniqueInput;
    }): Promise<UserRefreshToken> {
        const { select, where } = params;
        return this.prisma.userRefreshToken.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.refreshTokenKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }
}

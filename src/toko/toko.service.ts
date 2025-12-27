import { PrismaService } from "src/prisma.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Toko, Prisma } from "models";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.TokoSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
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

    async ownerCheck(params: {
        sub: string;
        role: string;
        userId: number;
    }): Promise<any> {
        const { role, sub, userId } = params;

        // Bypass this security for admin (developer)
        if (role == "Admin") {
            return;
        }

        const matchedUser: any = await this.prisma.user.findUnique({
            where: { id: userId, tlp: sub },
        });

        if (!matchedUser) throw new UnauthorizedException();
    }

    async create(newData: any): Promise<Toko> {
        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();

        // Prepare data
        const data: Prisma.TokoCreateInput = {
            ...newData,

            // Parse to integer
            userId: parseInt(newData.userId),

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
        return this.prisma.toko.findUnique({
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
        let updatedData: Prisma.TokoUpdateInput = { ...data };

        // Konfigurasi timestamp
        const thisTime = new Date().toISOString();
        updatedData.updatedAt = thisTime;

        // Save updated data
        return this.prisma.toko.update({ where, data: updatedData });
    }

    async remove(where: Prisma.TokoWhereUniqueInput): Promise<Toko> {
        return this.prisma.toko.delete({ where });
    }
}

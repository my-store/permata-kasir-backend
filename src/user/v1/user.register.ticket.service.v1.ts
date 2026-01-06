import { Prisma, UserRegisterTicket } from "models/client";
import { PrismaService } from "../../prisma.service";
import { Injectable, Logger } from "@nestjs/common";
import { generateId } from "src/libs/string";

// Placeholder | Short type name purpose only
interface DefaultKeysInterface extends Prisma.UserRegisterTicketSelect {}

const defaultKeys: DefaultKeysInterface = {
    id: true,
    code: true,

    // Parent table data
    adminId: true,
    userRankId: true,
};

@Injectable()
export class UserRegisterTicketServiceV1 {
    private readonly log: Logger = new Logger(UserRegisterTicketServiceV1.name);

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

    async create(data: any): Promise<UserRegisterTicket> {
        // Generated ticket must be not exist!
        let ticketIsUsed: any = false;

        // Generated ticket
        const code: string = generateId(6);

        // Find ticket
        try {
            ticketIsUsed = await this.findOne({ where: { code } });
        } catch {}

        // Ticket already created/ being used
        if (ticketIsUsed) {
            // Re-call this method
            return this.create(data);
        }

        // Hapus otomatis setelah 1 menit
        setTimeout(async () => {
            let ticketStillExist: any = false;
            try {
                ticketStillExist = await this.findOne({ where: { code } });
            } catch {}
            if (ticketStillExist) {
                try {
                    await this.remove({ code });
                    this.log.debug(
                        `User register ticket => "${code}" has been deleted!`,
                    );
                } catch {}
            }
        }, 60000);

        let newData: any = {
            ...data,

            // Generated data
            code,
        };

        // Save a new data
        return this.prisma.userRegisterTicket.create({ data: newData });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserRegisterTicketWhereUniqueInput;
        where?: Prisma.UserRegisterTicketWhereInput;
        orderBy?: Prisma.UserRegisterTicketOrderByWithRelationInput;
        select?: DefaultKeysInterface;
    }): Promise<UserRegisterTicket[]> {
        const { skip, take, cursor, where, orderBy, select } = params;
        return this.prisma.userRegisterTicket.findMany({
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
        where: Prisma.UserRegisterTicketWhereUniqueInput;
    }): Promise<UserRegisterTicket | null> {
        const { select, where } = params;
        return this.prisma.userRegisterTicket.findUniqueOrThrow({
            select: {
                // Default keys to display
                ...this.findOneKeys,

                // User specified keys to display
                ...select,
            },
            where,
        });
    }

    async remove(
        where: Prisma.UserRegisterTicketWhereUniqueInput,
    ): Promise<UserRegisterTicket> {
        return this.prisma.userRegisterTicket.delete({ where });
    }
}

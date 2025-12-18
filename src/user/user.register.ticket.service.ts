import { Prisma, UserRegisterTicket } from "../../prisma/generated/client";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { generateId } from "src/libs/string";

@Injectable()
export class UserRegisterTicketService {
    private readonly log: Logger = new Logger(UserRegisterTicketService.name);

    private readonly findOneKeys: Prisma.UserRegisterTicketSelect = {
        id: true,
        code: true,
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

            // Parse to intger
            adminId: parseInt(data.adminId),
        };

        // IMPORTANT !!!
        // Run cron-job to delete data after some minutes.

        // Save a new data
        return this.prisma.userRegisterTicket.create({ data: newData });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserRegisterTicketWhereUniqueInput;
        where?: Prisma.UserRegisterTicketWhereInput;
        orderBy?: Prisma.UserRegisterTicketOrderByWithRelationInput;
    }): Promise<UserRegisterTicket[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.userRegisterTicket.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async findOne(params: {
        select?: Prisma.UserRegisterTicketSelect;
        where: Prisma.UserRegisterTicketWhereUniqueInput;
    }): Promise<UserRegisterTicket | null> {
        const { select, where } = params;
        return this.prisma.userRegisterTicket.findUnique({
            select: { ...this.findOneKeys, ...select },
            where,
        });
    }

    async remove(
        where: Prisma.UserRegisterTicketWhereUniqueInput,
    ): Promise<UserRegisterTicket> {
        return this.prisma.userRegisterTicket.delete({ where });
    }
}

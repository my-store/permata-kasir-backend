import { Prisma, UserRegisterTicket } from "../../prisma/generated/client";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRegisterTicketService {
    private readonly findOneKeys: Prisma.UserRegisterTicketSelect = {
        id: true,
        code: true,
    };

    constructor(private readonly prisma: PrismaService) {}

    async create(data: any): Promise<UserRegisterTicket> {
        let newData: any = {
            ...data,

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

import { CreateMemberRankDtoV1 } from "./dto/create.member.rank.v1.dto";
import { UpdateMemberRankDtoV1 } from "./dto/update.member.rank.v1.dto";
import { MemberRankServiceV1 } from "./member.rank.service.v1";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { ParseUrlQuery } from "src/libs/string";
import { MemberRank, Prisma } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
    Controller,
    UseGuards,
    Request,
    Delete,
    Query,
    Param,
    Patch,
    Body,
    Post,
    Get,
} from "@nestjs/common";

@UseGuards(AuthGuardV1)
@Controller({ version: "1", path: "member-rank" })
export class MemberRankControllerV1 {
    constructor(private readonly service: MemberRankServiceV1) {}

    @Post()
    async create(
        @Body() newData: CreateMemberRankDtoV1,
        @Request() req: any,
    ): Promise<MemberRank> {
        let data: MemberRank;

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.inputOwnerCheck({
                ...req.user,
                userId: newData.userId,
                tokoId: newData.tokoId,
            });
        } catch {
            throw new UnauthorizedException();
        }

        // Make sure to remove userId before insert, because that is only
        // for security checking.
        const { userId, ...fixedNewData } = newData;

        try {
            data = await this.service.create(fixedNewData);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }

    @Get()
    async findAll(
        @Query() query: any,
        @Request() req: any,
    ): Promise<MemberRank[]> {
        let data: MemberRank[];
        try {
            data = await this.service.findAll(
                this.service.secureQueries({
                    queries: ParseUrlQuery(query),
                    headers: req.user,
                }),
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    // Getone method will return MemberRank object or nul, so set return type as any.
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Query() query: any,
        @Request() req: any,
    ): Promise<any> {
        const parsedQueries: any = ParseUrlQuery(query);
        let data: any;
        try {
            data = await this.service.findOne(
                this.service.secureQueries({
                    queries: {
                        // Query database yang dikirm pada URL
                        ...parsedQueries,

                        // Where statement
                        where: {
                            // Where statement pada query di URL (jika ada)
                            ...parsedQueries.where,

                            // Timpa dengan where.uuid = yang ada pada URL parameter
                            // jadi, pada query di URL tidak perlu menambahkan where={"uuid": "some_uuid"}.
                            uuid,
                        },
                    },
                    headers: req.user,
                }),
            );
        } catch (e) {
            throw new NotFoundException(e);
        }
        return data;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() data: UpdateMemberRankDtoV1,
        @Request() req: any,
    ): Promise<MemberRank> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }

        let memberRank: MemberRank;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.MemberRankWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            memberRank = await this.service.update(
                q.where,
                this.service.cleanUpdateData(data),
            );
        } catch (error) {
            throw new NotFoundException(error);
        }
        return memberRank;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<MemberRank> {
        let data: MemberRank;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.MemberRankWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            data = await this.service.remove(q.where);
        } catch (error) {
            throw new NotFoundException(error);
        }
        return data;
    }
}

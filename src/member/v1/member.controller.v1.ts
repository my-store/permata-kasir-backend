import { CreateMemberDtoV1 } from "./dto/create.member.v1.dto";
import { UpdateMemberDtoV1 } from "./dto/update.member.v1.dto";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { MemberServiceV1 } from "./member.service.v1";
import { ParseUrlQuery } from "src/libs/string";
import { Member, Prisma } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
    Controller,
    UseGuards,
    Request,
    Delete,
    Param,
    Patch,
    Query,
    Body,
    Post,
    Get,
} from "@nestjs/common";

@UseGuards(AuthGuardV1)
@Controller({ version: "1", path: "member" })
export class MemberControllerV1 {
    constructor(private readonly service: MemberServiceV1) {}

    @Post()
    async create(
        @Body() newData: CreateMemberDtoV1,
        @Request() req: any,
    ): Promise<Member> {
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

        // Menyimpan data
        let createdMember: Member;
        try {
            createdMember = await this.service.create(fixedNewData);
        } catch (error) {
            // Prisma error
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Unique key error
                if (error.code === "P2002") {
                    throw new BadRequestException(
                        `Nomor tlp ${newData.tlp} telah digunakan`,
                    );
                }
                // Other Prisma errors
                else {
                    throw new InternalServerErrorException(error);
                }
            }
            // Other non-Prisma error
            else {
                throw new InternalServerErrorException(error);
            }
        }
        return createdMember;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Member[]> {
        let data: Member[];
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

    // Getone method will return Member object or nul, so set return type as any.
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
        } catch {
            throw new NotFoundException();
        }
        return data;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() data: UpdateMemberDtoV1,
        @Request() req: any,
    ): Promise<Member> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }

        let member: Member;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.MemberWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            member = await this.service.update(
                q.where,
                this.service.cleanUpdateData(data),
            );
        } catch (error) {
            throw new NotFoundException(error);
        }
        return member;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<Member> {
        let member: Member;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.MemberWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            member = await this.service.remove(q.where);
        } catch {
            throw new NotFoundException();
        }
        return member;
    }
}

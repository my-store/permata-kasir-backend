import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MemberService } from "./member.service";
import { AuthGuard } from "src/auth/auth.guard";
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

@UseGuards(AuthGuard)
@Controller("api/member")
export class MemberController {
    constructor(private readonly service: MemberService) {}

    @Post()
    async create(
        @Body() newData: CreateMemberDto,
        @Request() req: any,
    ): Promise<Member> {
        let member: Member;

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
            member = await this.service.create(fixedNewData);
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

        return member;
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
        @Body() data: UpdateMemberDto,
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
            member = await this.service.update(q.where, data);
        } catch (error) {
            throw new InternalServerErrorException(error);
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

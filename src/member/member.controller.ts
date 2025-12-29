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

    userGetQuery(q: any, tlp: string): any {
        let qx: any = { ...q };
        qx["where"] = {
            // If user spesified some where statement
            ...qx["where"],
            // For security reason, display onle member that owned by this user (who send the request)
            toko: {
                user: {
                    tlp, // Get by unique key
                },
            },
        };
        return qx;
    }

    @Post()
    async create(
        @Body() newData: CreateMemberDto,
        @Request() req: any,
    ): Promise<Member> {
        let member: Member;

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.ownerCheck({
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
        let q: any = { ...ParseUrlQuery(query) };

        // Data login admin/ user
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.userGetQuery(q, sub);
        }

        try {
            data = await this.service.findAll(q);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    // Getone method will return Member object or nul, so set return type as any.
    @Get(":tlp")
    async findOne(
        @Param("tlp") tlp: string,
        @Query() query: any,
        @Request() req: any,
    ): Promise<any> {
        let data: any;
        let q: any = { ...ParseUrlQuery(query) };

        // Data login admin/ user
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.userGetQuery(q, sub);
        }

        try {
            data = await this.service.findOne({
                ...q, // Other arguments (specified by user in URL)

                // Override user where statement (if exist)
                where: {
                    // Get one by some tlp (on URL as a parameter)
                    tlp,

                    // Also show only if this request come from the author
                    ...q["where"],
                },
            });
        } catch {
            throw new NotFoundException();
        }

        return data;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() updatedData: UpdateMemberDto,
        @Request() req: any,
    ): Promise<Member> {
        let member: Member;

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.ownerCheck({
                ...req.user,
                userId: updatedData.userId,
                tokoId: updatedData.tokoId,
            });
        } catch {
            throw new UnauthorizedException();
        }

        // Make sure to remove userId before insert, because that is only
        // for security checking.
        const { userId, ...fixedupdatedData } = updatedData;

        try {
            member = await this.service.update({ uuid }, fixedupdatedData);
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

        // Where statement
        let where: Prisma.MemberWhereUniqueInput = {
            uuid,
        };

        // Data login admin/ user
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            where.toko = {
                // Pastikan si pengirim request ini adalah pemilik toko
                // dimana toko tersebut adalah pemilik member yang akan dihapus.
                user: {
                    tlp: sub,
                },
            };
        }

        try {
            member = await this.service.remove(where);
        } catch {
            throw new NotFoundException();
        }

        return member;
    }
}

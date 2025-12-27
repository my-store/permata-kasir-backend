import { CreateMemberRankingDto } from "./dto/create-member-ranking.dto";
import { UpdateMemberRankingDto } from "./dto/update-member-ranking.dto";
import { MemberRankingService } from "./member-ranking.service";
import { ParseUrlQuery } from "src/libs/string";
import { AuthGuard } from "src/auth/auth.guard";
import { MemberRanking, Prisma } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
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

@UseGuards(AuthGuard)
@Controller("api/member-ranking")
export class MemberRankingController {
    constructor(private readonly service: MemberRankingService) {}

    modifyQueryForThisUser(q: any, tlp: string): any {
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
        @Body() newData: CreateMemberRankingDto,
        @Request() req: any,
    ): Promise<MemberRanking> {
        let data: MemberRanking;

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
            data = await this.service.create(fixedNewData);
        } catch (error) {
            // Prisma error
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // The `code` property is the Prisma error code.
                if (error.code === "P2003") {
                    throw new BadRequestException(
                        "Foreign key constraint failed. The specified author does not exist.",
                    );
                } else {
                    // Handle other Prisma errors
                    throw new InternalServerErrorException(error);
                }
            }
            // Other error
            else {
                // Handle non-Prisma errors
                throw new InternalServerErrorException(error);
            }
        }
        return data;
    }

    @Get()
    async findAll(
        @Query() query: any,
        @Request() req: any,
    ): Promise<MemberRanking[]> {
        let data: MemberRanking[];
        let q: any = { ...ParseUrlQuery(query) };

        // Hanya tampilkan data milik si user yang sedang login saja
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.modifyQueryForThisUser(q, sub);
        }

        try {
            data = await this.service.findAll(q);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    // Getone method will return MemberRanking object or nul, so set return type as any.
    @Get(":id")
    async findOne(
        @Param("id") id: string,
        @Query() query: any,
        @Request() req: any,
    ): Promise<any> {
        let data: any;
        let q: any = { ...ParseUrlQuery(query) };

        // Hanya tampilkan data milik si user yang sedang login saja
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.modifyQueryForThisUser(q, sub);
        }

        try {
            data = await this.service.findOne({
                ...q, // Other arguments (specified by user in URL)

                where: {
                    // Get one by some id (on URL as a parameter)
                    id: parseInt(id),

                    // Also show only if this request come from the author
                    ...q["where"],
                },
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updatedData: UpdateMemberRankingDto,
        @Request() req: any,
    ): Promise<MemberRanking> {
        let data: MemberRanking;

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
            data = await this.service.update(
                { id: parseInt(id) },
                fixedupdatedData,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }

    @Delete(":id")
    async remove(@Param("id") id: string): Promise<MemberRanking> {
        let data: MemberRanking;
        try {
            data = await this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }
}

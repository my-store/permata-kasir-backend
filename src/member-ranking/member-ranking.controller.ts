import { CreateMemberRankingDto } from "./dto/create-member-ranking.dto";
import { UpdateMemberRankingDto } from "./dto/update-member-ranking.dto";
import { MemberRankingService } from "./member-ranking.service";
import { MemberRanking, Prisma } from "models";
import {
    InternalServerErrorException,
    BadRequestException,
    Controller,
    Delete,
    Query,
    Param,
    Patch,
    Body,
    Post,
    Get,
} from "@nestjs/common";
import { ParseUrlQuery } from "src/libs/string";

@Controller("api/member-ranking")
export class MemberRankingController {
    constructor(private readonly service: MemberRankingService) {}

    @Post()
    async create(
        @Body() createMemberRankingDto: CreateMemberRankingDto,
    ): Promise<MemberRanking> {
        let data: MemberRanking;
        try {
            data = await this.service.create(createMemberRankingDto);
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
    async findAll(@Query() query: any): Promise<MemberRanking[]> {
        let data: MemberRanking[];
        try {
            data = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    // Getone method will return MemberRanking object or nul, so set return type as any.
    @Get(":id")
    async findOne(@Param("id") id: string, @Query() query: any): Promise<any> {
        let data: any;
        try {
            data = await this.service.findOne({
                where: { id: parseInt(id) },
                ...ParseUrlQuery(query),
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
    ): Promise<MemberRanking> {
        let data: MemberRanking;
        try {
            data = await this.service.update({ id: parseInt(id) }, updatedData);
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

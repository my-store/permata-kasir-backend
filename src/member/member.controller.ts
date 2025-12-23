import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MemberService } from "./member.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Member, Prisma } from "models";
import {
    InternalServerErrorException,
    BadRequestException,
    Controller,
    UseGuards,
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

    @Get()
    async findAll(@Query() query: any): Promise<Member[]> {
        let data: Member[];
        try {
            data = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Post()
    async create(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
        let member: Member;
        try {
            member = await this.service.create(createMemberDto);
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
        return member;
    }

    // Getone method will return Admin object or nul, so set return type as any.
    @Get(":tlp")
    async findOne(@Param("tlp") tlp: string): Promise<any> {
        let data: any;
        try {
            data = await this.service.findOne({ where: { tlp } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updateMemberDto: UpdateMemberDto,
    ): Promise<Member> {
        let member: Member;
        try {
            member = await this.service.update(
                { id: parseInt(id) },
                updateMemberDto,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return member;
    }

    @Delete(":id")
    async remove(@Param("id") id: string): Promise<Member> {
        let member: Member;
        try {
            member = await this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return member;
    }
}

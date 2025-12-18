import {
    InternalServerErrorException,
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
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MemberService } from "./member.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Member } from "models";

@Controller("member")
export class MemberController {
    constructor(private readonly service: MemberService) {}

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Query() query: any): Promise<Member[]> {
        const args: any = ParseUrlQuery(query);
        let data: Member[];

        try {
            data = await this.service.findAll(args);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() createMemberDto: CreateMemberDto) {
        return this.service.create(createMemberDto);
    }

    @UseGuards(AuthGuard)
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<Member | null> {
        let data: Member | null;

        try {
            data = await this.service.findOne({ where: { id: parseInt(id) } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateMemberDto: UpdateMemberDto) {
        return this.service.update({ id: parseInt(id) }, updateMemberDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove({ id: parseInt(id) });
    }
}

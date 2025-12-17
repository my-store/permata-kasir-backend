import {
    InternalServerErrorException,
    Controller,
    UseGuards,
    Delete,
    Param,
    Query,
    Patch,
    Post,
    Body,
    Get,
} from "@nestjs/common";
import { CreateDiskonDto } from "./dto/create-diskon.dto";
import { UpdateDiskonDto } from "./dto/update-diskon.dto";
import { DiskonService } from "./diskon.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Diskon } from "prisma/generated";

@Controller("diskon")
export class DiskonController {
    constructor(private readonly service: DiskonService) {}

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Query() query: any): Promise<Diskon[]> {
        const args: any = ParseUrlQuery(query);
        let data: Diskon[];

        try {
            data = await this.service.findAll(args);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() createDiskonDto: CreateDiskonDto) {
        return this.service.create(createDiskonDto);
    }

    @UseGuards(AuthGuard)
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<Diskon | null> {
        let data: Diskon | null;

        try {
            data = await this.service.findOne({ where: { id: parseInt(id) } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateDiskonDto: UpdateDiskonDto) {
        return this.service.update({ id: parseInt(id) }, updateDiskonDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove({ id: parseInt(id) });
    }
}

import { CreateDiskonDto } from "./dto/create-diskon.dto";
import { UpdateDiskonDto } from "./dto/update-diskon.dto";
import { DiskonService } from "./diskon.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Diskon } from "models";
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

@UseGuards(AuthGuard)
@Controller("api/diskon")
export class DiskonController {
    constructor(private readonly service: DiskonService) {}

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

    @Post()
    create(@Body() createDiskonDto: CreateDiskonDto) {
        try {
            return this.service.create(createDiskonDto);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

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
        try {
            return this.service.update({ id: parseInt(id) }, updateDiskonDto);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        try {
            return this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

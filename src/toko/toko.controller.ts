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
import { CreateTokoDto } from "./dto/create-toko.dto";
import { UpdateTokoDto } from "./dto/update-toko.dto";
import { TokoService } from "./toko.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Toko } from "models";

@UseGuards(AuthGuard)
@Controller("api/toko")
export class TokoController {
    constructor(private readonly service: TokoService) {}

    @Get()
    async findAll(@Query() query: any): Promise<Toko[]> {
        const args: any = ParseUrlQuery(query);
        let data: Toko[];

        try {
            data = await this.service.findAll(args);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @Post()
    create(@Body() createTokoDto: CreateTokoDto) {
        return this.service.create(createTokoDto);
    }

    @Get(":id")
    async findOne(@Param("id") id: string): Promise<Toko | null> {
        let data: Toko | null;

        try {
            data = await this.service.findOne({ where: { id: parseInt(id) } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateTokoDto: UpdateTokoDto) {
        return this.service.update({ id: parseInt(id) }, updateTokoDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove({ id: parseInt(id) });
    }
}

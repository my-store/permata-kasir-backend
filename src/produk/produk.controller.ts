import {
    InternalServerErrorException,
    Controller,
    UseGuards,
    Delete,
    Param,
    Query,
    Patch,
    Body,
    Post,
    Get,
} from "@nestjs/common";
import { CreateProdukDto } from "./dto/create-produk.dto";
import { UpdateProdukDto } from "./dto/update-produk.dto";
import { ProdukService } from "./produk.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Produk } from "prisma/generated";

@Controller("produk")
export class ProdukController {
    constructor(private readonly service: ProdukService) {}

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Query() query: any): Promise<Produk[]> {
        const args: any = ParseUrlQuery(query);
        let data: Produk[];

        try {
            data = await this.service.findAll(args);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() createProdukDto: CreateProdukDto) {
        return this.service.create(createProdukDto);
    }

    @UseGuards(AuthGuard)
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<Produk | null> {
        let data: Produk | null;

        try {
            data = await this.service.findOne({ where: { id: parseInt(id) } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateProdukDto: UpdateProdukDto) {
        return this.service.update({ id: parseInt(id) }, updateProdukDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove({ id: parseInt(id) });
    }
}

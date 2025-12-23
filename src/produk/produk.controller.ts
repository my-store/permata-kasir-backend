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
import { Produk } from "models";

@UseGuards(AuthGuard)
@Controller("api/produk")
export class ProdukController {
    constructor(private readonly service: ProdukService) {}

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

    @Post()
    async create(@Body() createProdukDto: CreateProdukDto): Promise<Produk> {
        try {
            return this.service.create(createProdukDto);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

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
        try {
            return this.service.update({ id: parseInt(id) }, updateProdukDto);
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

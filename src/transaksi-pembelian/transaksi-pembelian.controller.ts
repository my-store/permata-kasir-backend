import {
    InternalServerErrorException,
    Controller,
    UseGuards,
    Delete,
    Query,
    Patch,
    Param,
    Body,
    Post,
    Get,
} from "@nestjs/common";
import { CreateTransaksiPembelianDto } from "./dto/create-transaksi-pembelian.dto";
import { UpdateTransaksiPembelianDto } from "./dto/update-transaksi-pembelian.dto";
import { TransaksiPembelianService } from "./transaksi-pembelian.service";
import { TransaksiPembelian } from "prisma/generated";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";

@Controller("transaksi-pembelian")
export class TransaksiPembelianController {
    constructor(private readonly service: TransaksiPembelianService) {}

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Query() query: any): Promise<TransaksiPembelian[]> {
        const args: any = ParseUrlQuery(query);
        let data: TransaksiPembelian[];

        try {
            data = await this.service.findAll(args);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() createTransaksiPembelianDto: CreateTransaksiPembelianDto) {
        return this.service.create(createTransaksiPembelianDto);
    }

    @UseGuards(AuthGuard)
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<TransaksiPembelian | null> {
        let data: TransaksiPembelian | null;

        try {
            data = await this.service.findOne({ where: { id: parseInt(id) } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @Patch(":id")
    update(
        @Param("id") id: string,
        @Body() updateTransaksiPembelianDto: UpdateTransaksiPembelianDto,
    ) {
        return this.service.update(
            { id: parseInt(id) },
            updateTransaksiPembelianDto,
        );
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove({ id: parseInt(id) });
    }
}

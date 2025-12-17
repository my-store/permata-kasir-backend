import {
    InternalServerErrorException,
    Controller,
    UseGuards,
    Delete,
    Param,
    Patch,
    Query,
    Post,
    Body,
    Get,
} from "@nestjs/common";
import { CreateTransaksiPenjualanDto } from "./dto/create-transaksi-penjualan.dto";
import { UpdateTransaksiPenjualanDto } from "./dto/update-transaksi-penjualan.dto";
import { TransaksiPenjualanService } from "./transaksi-penjualan.service";
import { TransaksiPenjualan } from "prisma/generated";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";

@Controller("transaksi-penjualan")
export class TransaksiPenjualanController {
    constructor(private readonly service: TransaksiPenjualanService) {}

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Query() query: any): Promise<TransaksiPenjualan[]> {
        const args: any = ParseUrlQuery(query);
        let data: TransaksiPenjualan[];

        try {
            data = await this.service.findAll(args);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }

        return data;
    }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() createTransaksiPenjualanDto: CreateTransaksiPenjualanDto) {
        return this.service.create(createTransaksiPenjualanDto);
    }

    @UseGuards(AuthGuard)
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<TransaksiPenjualan | null> {
        let data: TransaksiPenjualan | null;

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
        @Body() updateTransaksiPenjualanDto: UpdateTransaksiPenjualanDto,
    ) {
        return this.service.update(
            { id: parseInt(id) },
            updateTransaksiPenjualanDto,
        );
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove({ id: parseInt(id) });
    }
}

import { CreateTransaksiPenjualanDto } from "./dto/create-transaksi-penjualan.dto";
import { UpdateTransaksiPenjualanDto } from "./dto/update-transaksi-penjualan.dto";
import { TransaksiPenjualanService } from "./transaksi-penjualan.service";
import { ParseUrlQuery } from "src/libs/string";
import { AuthGuard } from "src/auth/auth.guard";
import { TransaksiPenjualan } from "models";
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

@UseGuards(AuthGuard)
@Controller("transaksi-penjualan")
export class TransaksiPenjualanController {
    constructor(private readonly service: TransaksiPenjualanService) {}

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

    @Post()
    create(@Body() createTransaksiPenjualanDto: CreateTransaksiPenjualanDto) {
        return this.service.create(createTransaksiPenjualanDto);
    }

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

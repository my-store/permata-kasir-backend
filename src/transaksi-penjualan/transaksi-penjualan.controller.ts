import { CreateTransaksiPenjualanDto } from "./dto/create-transaksi-penjualan.dto";
import { UpdateTransaksiPenjualanDto } from "./dto/update-transaksi-penjualan.dto";
import { TransaksiPenjualanService } from "./transaksi-penjualan.service";
import { Prisma, TransaksiPenjualan } from "models";
import { ParseUrlQuery } from "src/libs/string";
import { AuthGuard } from "src/auth/auth.guard";
import {
    InternalServerErrorException,
    BadRequestException,
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
@Controller("api/transaksi-penjualan")
export class TransaksiPenjualanController {
    constructor(private readonly service: TransaksiPenjualanService) {}

    @Get()
    async findAll(@Query() query: any): Promise<TransaksiPenjualan[]> {
        let data: TransaksiPenjualan[];
        try {
            data = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Post()
    async create(
        @Body() createTransaksiPenjualanDto: CreateTransaksiPenjualanDto,
    ): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;
        try {
            data = await this.service.create(createTransaksiPenjualanDto);
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
        return data;
    }

    // Getone method will return Admin object or nul, so set return type as any.
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<any> {
        let data: any;
        try {
            data = await this.service.findOne({ where: { id: parseInt(id) } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updateTransaksiPenjualanDto: UpdateTransaksiPenjualanDto,
    ): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;
        try {
            data = await this.service.update(
                { id: parseInt(id) },
                updateTransaksiPenjualanDto,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }

    @Delete(":id")
    async remove(@Param("id") id: string): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;
        try {
            data = await this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }
}

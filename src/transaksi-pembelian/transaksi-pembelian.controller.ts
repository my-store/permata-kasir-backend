import { CreateTransaksiPembelianDto } from "./dto/create-transaksi-pembelian.dto";
import { UpdateTransaksiPembelianDto } from "./dto/update-transaksi-pembelian.dto";
import { TransaksiPembelianService } from "./transaksi-pembelian.service";
import { Prisma, TransaksiPembelian } from "models";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import {
    InternalServerErrorException,
    BadRequestException,
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

@UseGuards(AuthGuard)
@Controller("api/transaksi-pembelian")
export class TransaksiPembelianController {
    constructor(private readonly service: TransaksiPembelianService) {}

    @Get()
    async findAll(@Query() query: any): Promise<TransaksiPembelian[]> {
        let data: TransaksiPembelian[];
        try {
            data = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Post()
    async create(
        @Body() createTransaksiPembelianDto: CreateTransaksiPembelianDto,
    ): Promise<TransaksiPembelian> {
        let data: TransaksiPembelian;
        try {
            data = await this.service.create(createTransaksiPembelianDto);
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
        @Body() updateTransaksiPembelianDto: UpdateTransaksiPembelianDto,
    ): Promise<TransaksiPembelian> {
        let data: TransaksiPembelian;
        try {
            data = await this.service.update(
                { id: parseInt(id) },
                updateTransaksiPembelianDto,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }

    @Delete(":id")
    async remove(@Param("id") id: string): Promise<TransaksiPembelian> {
        let data: TransaksiPembelian;
        try {
            data = await this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }
}

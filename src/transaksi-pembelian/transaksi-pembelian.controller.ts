import { CreateTransaksiPembelianDto } from "./dto/create-transaksi-pembelian.dto";
import { UpdateTransaksiPembelianDto } from "./dto/update-transaksi-pembelian.dto";
import { TransaksiPembelianService } from "./transaksi-pembelian.service";
import { Prisma, TransaksiPembelian } from "models";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    Controller,
    UseGuards,
    Request,
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

    @Post()
    async create(
        @Body() newData: CreateTransaksiPembelianDto,
        @Request() req: any,
    ): Promise<TransaksiPembelian> {
        let data: TransaksiPembelian;

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.ownerCheck({
                ...req.user,
                userId: newData.userId,
                tokoId: newData.tokoId,
            });
        } catch {
            throw new UnauthorizedException();
        }

        // Make sure to remove userId before insert, because that is only
        // for security checking.
        const { userId, ...fixedNewData } = newData;

        try {
            data = await this.service.create(fixedNewData);
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

    // Getone method will return TransaksiPembelian object or nul, so set return type as any.
    @Get(":id")
    async findOne(@Param("id") id: string, @Query() query: any): Promise<any> {
        let data: any;
        try {
            data = await this.service.findOne({
                where: { id: parseInt(id) },
                ...ParseUrlQuery(query),
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updatedData: UpdateTransaksiPembelianDto,
        @Request() req: any,
    ): Promise<TransaksiPembelian> {
        let data: TransaksiPembelian;

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.ownerCheck({
                ...req.user,
                userId: updatedData.userId,
                tokoId: updatedData.tokoId,
            });
        } catch {
            throw new UnauthorizedException();
        }

        // Make sure to remove userId before insert, because that is only
        // for security checking.
        const { userId, ...fixedupdatedData } = updatedData;

        try {
            data = await this.service.update(
                { id: parseInt(id) },
                fixedupdatedData,
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

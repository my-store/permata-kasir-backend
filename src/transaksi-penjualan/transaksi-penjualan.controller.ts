import { CreateTransaksiPenjualanDto } from "./dto/create-transaksi-penjualan.dto";
import { UpdateTransaksiPenjualanDto } from "./dto/update-transaksi-penjualan.dto";
import { TransaksiPenjualanService } from "./transaksi-penjualan.service";
import { Prisma, TransaksiPenjualan } from "models";
import { ParseUrlQuery } from "src/libs/string";
import { AuthGuard } from "src/auth/auth.guard";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    Controller,
    UseGuards,
    Request,
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

    @Post()
    async create(
        @Body() newData: CreateTransaksiPenjualanDto,
        @Request() req: any,
    ): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;

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
    async findAll(@Query() query: any): Promise<TransaksiPenjualan[]> {
        let data: TransaksiPenjualan[];
        try {
            data = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    // Getone method will return TransaksiPenjualan object or nul, so set return type as any.
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Query() query: any,
    ): Promise<any> {
        let data: any;
        try {
            data = await this.service.findOne({
                where: { uuid },
                ...ParseUrlQuery(query),
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() updatedData: UpdateTransaksiPenjualanDto,
        @Request() req: any,
    ): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;

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
            data = await this.service.update({ uuid }, fixedupdatedData);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }

    @Delete(":uuid")
    async remove(@Param("uuid") uuid: string): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;
        try {
            data = await this.service.remove({ uuid });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return data;
    }
}

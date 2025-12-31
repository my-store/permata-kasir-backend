import { CreateTransaksiPembelianDto } from "./dto/create-transaksi-pembelian.dto";
import { UpdateTransaksiPembelianDto } from "./dto/update-transaksi-pembelian.dto";
import { TransaksiPembelianService } from "./transaksi-pembelian.service";
import { Prisma, TransaksiPembelian } from "models";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import {
    InternalServerErrorException,
    UnauthorizedException,
    NotFoundException,
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
            await this.service.inputOwnerCheck({
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
            throw new InternalServerErrorException(error);
        }
        return data;
    }

    @Get()
    async findAll(
        @Query() query: any,
        @Request() req: any,
    ): Promise<TransaksiPembelian[]> {
        let data: TransaksiPembelian[];
        try {
            data = await this.service.findAll(
                this.service.secureQueries({
                    queries: ParseUrlQuery(query),
                    headers: req.user,
                }),
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    // Getone method will return TransaksiPembelian object or nul, so set return type as any.
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Query() query: any,
        @Request() req: any,
    ): Promise<any> {
        const parsedQueries: any = ParseUrlQuery(query);
        let data: any;
        try {
            data = await this.service.findOne(
                this.service.secureQueries({
                    queries: {
                        // Query database yang dikirm pada URL
                        ...parsedQueries,

                        // Where statement
                        where: {
                            // Where statement pada query di URL (jika ada)
                            ...parsedQueries.where,

                            // Timpa dengan where.uuid = yang ada pada URL parameter
                            // jadi, pada query di URL tidak perlu menambahkan where={"uuid": "some_uuid"}.
                            uuid,
                        },
                    },
                    headers: req.user,
                }),
            );
        } catch (e) {
            throw new NotFoundException(e);
        }
        return data;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() data: UpdateTransaksiPembelianDto,
        @Request() req: any,
    ): Promise<TransaksiPembelian> {
        let transaksiPembelian: TransaksiPembelian;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.TransaksiPembelianWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            transaksiPembelian = await this.service.update(q.where, data);
        } catch (error) {
            throw new NotFoundException(error);
        }
        return transaksiPembelian;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<TransaksiPembelian> {
        let transaksiPembelian: TransaksiPembelian;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.TransaksiPembelianWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            transaksiPembelian = await this.service.remove(q.where);
        } catch (error) {
            throw new NotFoundException(error);
        }
        return transaksiPembelian;
    }
}

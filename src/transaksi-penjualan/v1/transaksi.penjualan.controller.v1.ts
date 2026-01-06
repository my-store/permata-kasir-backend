import { CreateTransaksiPenjualanDtoV1 } from "./dto/create.transaksi.penjualan.v1.dto";
import { UpdateTransaksiPenjualanDtoV1 } from "./dto/update.transaksi.penjualan.v1.dto";
import { TransaksiPenjualanServiceV1 } from "./transaksi.penjualan.service.v1";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { Prisma, TransaksiPenjualan } from "models";
import { ParseUrlQuery } from "src/libs/string";
import {
    InternalServerErrorException,
    UnauthorizedException,
    NotFoundException,
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

@UseGuards(AuthGuardV1)
@Controller({ version: "1", path: "transaksi-penjualan" })
export class TransaksiPenjualanControllerV1 {
    constructor(private readonly service: TransaksiPenjualanServiceV1) {}

    @Post()
    async create(
        @Body() newData: CreateTransaksiPenjualanDtoV1,
        @Request() req: any,
    ): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;

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
    ): Promise<TransaksiPenjualan[]> {
        let data: TransaksiPenjualan[];
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

    // Getone method will return TransaksiPenjualan object or nul, so set return type as any.
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
        @Body() data: UpdateTransaksiPenjualanDtoV1,
        @Request() req: any,
    ): Promise<TransaksiPenjualan> {
        let transaksiPenjualan: TransaksiPenjualan;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.TransaksiPenjualanWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            transaksiPenjualan = await this.service.update(q.where, data);
        } catch (error) {
            throw new NotFoundException(error);
        }
        return transaksiPenjualan;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<TransaksiPenjualan> {
        let data: TransaksiPenjualan;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.TransaksiPenjualanWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            data = await this.service.remove(q.where);
        } catch (error) {
            throw new NotFoundException(error);
        }
        return data;
    }
}

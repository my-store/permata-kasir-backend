import { CreateProdukDtoV1 } from "./dto/create.produk.v1.dto";
import { UpdateProdukDtoV1 } from "./dto/update.produk.v1.dto";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { ProdukServiceV1 } from "./produk.service.v1";
import { ParseUrlQuery } from "src/libs/string";
import { Prisma, Produk } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
    Controller,
    UseGuards,
    Request,
    Delete,
    Param,
    Query,
    Patch,
    Body,
    Post,
    Get,
} from "@nestjs/common";

@UseGuards(AuthGuardV1)
@Controller({ version: "1", path: "produk" })
export class ProdukControllerV1 {
    constructor(private readonly service: ProdukServiceV1) {}

    @Post()
    async create(
        @Body() newData: CreateProdukDtoV1,
        @Request() req: any,
    ): Promise<Produk> {
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
        // If not removed, will cause error.
        const { userId, ...fixedNewData } = newData;

        // Menyimpan data
        let createdProduk: Produk;
        try {
            createdProduk = await this.service.create(fixedNewData);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return createdProduk;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Produk[]> {
        let produk: Produk[];
        try {
            produk = await this.service.findAll(
                this.service.secureQueries({
                    queries: ParseUrlQuery(query),
                    headers: req.user,
                }),
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return produk;
    }

    // Getone method will return Produk object or nul, so set return type as any.
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
        } catch {
            throw new NotFoundException();
        }
        return data;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() data: UpdateProdukDtoV1,
        @Request() req: any,
    ): Promise<Produk> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }

        let produk: Produk;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.ProdukWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            produk = await this.service.update(
                q.where,
                this.service.cleanUpdateData(data),
            );
        } catch (error) {
            throw new NotFoundException(error);
        }
        return produk;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<Produk> {
        let produk: Produk;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.ProdukWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            produk = await this.service.remove(q.where);
        } catch {
            throw new NotFoundException();
        }
        return produk;
    }
}

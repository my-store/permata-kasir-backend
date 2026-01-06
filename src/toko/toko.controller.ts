import { InputOwnerCheckInterface, TokoService } from "./toko.service";
import { CreateTokoDto } from "./dto/create-toko.dto";
import { UpdateTokoDto } from "./dto/update-toko.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Prisma, Toko } from "models";
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
    Post,
    Body,
    Get,
} from "@nestjs/common";

@UseGuards(AuthGuard)
@Controller("api/toko")
export class TokoController {
    constructor(private readonly service: TokoService) {}

    @Post()
    async create(
        @Body() newData: CreateTokoDto,
        @Request() req: any,
    ): Promise<Toko> {
        let toko: Toko;

        // Cek pemilik dan jumlah kuota pembuatan toko
        try {
            // Hasil pengecekan akan mengembalikan object { status, paid }
            const { status, paid }: InputOwnerCheckInterface =
                await this.service.inputOwnerCheck({
                    ...req.user,
                    userId: newData.userId,
                });
            // Ada kesalahan
            if (!status) {
                let errMsg: string; // Error user message
                let errCode: number; // Error user code
                // Free user
                if (!paid) {
                    errMsg =
                        "Silahkan upgrade ke premium untuk membuat toko lagi.";
                    errCode = 401;
                }
                // Paid user
                else {
                    errMsg =
                        "Maksimal jumlah toko telah tercapai, silahkan upgrade paket anda.";
                    errCode = 200;
                }
                throw new BadRequestException({ errMsg, errCode });
            }
        } catch (error) {
            throw new UnauthorizedException(error);
        }

        try {
            toko = await this.service.create(newData);
        } catch (error) {
            // Prisma error
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Unique key error
                if (error.code === "P2002") {
                    throw new BadRequestException(
                        `Nomor tlp ${newData.tlp} telah digunakan`,
                    );
                }

                // Other Prisma errors
                else {
                    throw new InternalServerErrorException(error);
                }
            }

            // Other non-Prisma error
            else {
                throw new InternalServerErrorException(error);
            }
        }
        return toko;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Toko[]> {
        let data: Toko[];
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

    // Getone method will return Toko object or nul, so set return type as any.
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
        @Body() data: UpdateTokoDto,
        @Request() req: any,
    ): Promise<Toko> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }

        let toko: Toko;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.TokoWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            toko = await this.service.update(
                q.where,

                // Data yang telah dibersihkan dari kolom2 yang memang tidak boleh diubah.
                this.service.cleanUpdateData(data),
            );
        } catch {
            throw new NotFoundException();
        }
        return toko;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<Toko> {
        let deletedToko: Toko;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.TokoWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            deletedToko = await this.service.remove(q.where);
        } catch {
            throw new NotFoundException();
        }
        return deletedToko;
    }
}

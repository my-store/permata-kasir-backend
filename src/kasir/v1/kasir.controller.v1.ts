import { UpdateKasirDtoV1 } from "./dto/update.kasir.v1.dto";
import { CreateKasirDtoV1 } from "./dto/create.kasir.v1.dto";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { KasirServiceV1 } from "./kasir.service.v1";
import { ParseUrlQuery } from "src/libs/string";
import { Kasir, Prisma } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
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

@UseGuards(AuthGuardV1)
@Controller({ version: "1", path: "kasir" })
export class KasirControllerV1 {
    constructor(private readonly service: KasirServiceV1) {}

    @Post()
    async create(
        @Body() newData: CreateKasirDtoV1,
        @Request() req: any,
    ): Promise<Kasir> {
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

        // Menyimpan data
        let createdKasir: Kasir;
        try {
            createdKasir = await this.service.create(
                // Cleaned insert data
                this.service.cleanInsertData(newData),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return createdKasir;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Kasir[]> {
        let kasir: Kasir[];
        try {
            kasir = await this.service.findAll(
                this.service.secureQueries({
                    queries: ParseUrlQuery(query),
                    headers: req.user,
                }),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return kasir;
    }

    // Getone method will return Kasir object or nul, so set return type as any.
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

    @Patch(":tlp")
    async update(
        @Param("tlp") tlp: string,
        @Body() data: UpdateKasirDtoV1,
        @Request() req: any,
    ): Promise<Kasir> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }
        let kasir: Kasir;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.KasirWhereUniqueInput>{
                    tlp,
                },
            },
            headers: req.user,
        });
        try {
            kasir = await this.service.update(
                q.where,
                this.service.cleanUpdateData(data),
            );
        } catch (error) {
            throw new NotFoundException(error);
        }
        return kasir;
    }

    @Delete(":tlp")
    async remove(
        @Param("tlp") tlp: string,
        @Request() req: any,
    ): Promise<Kasir> {
        let kasir: Kasir;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.KasirWhereUniqueInput>{
                    tlp,
                },
            },
            headers: req.user,
        });
        try {
            kasir = await this.service.remove(q.where);
        } catch {
            throw new NotFoundException();
        }
        return kasir;
    }
}

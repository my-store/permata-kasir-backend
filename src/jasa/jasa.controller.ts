import { CreateJasaDto } from "./dto/create-jasa.dto";
import { UpdateJasaDto } from "./dto/update-jasa.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { JasaService } from "./jasa.service";
import { Prisma, Jasa } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
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

@UseGuards(AuthGuard)
@Controller("api/jasa")
export class JasaController {
    constructor(private readonly service: JasaService) {}

    @Post()
    async create(
        @Body() newData: CreateJasaDto,
        @Request() req: any,
    ): Promise<Jasa> {
        // Save inserted data into a variable, if not the server will shutdown when error occured.
        let jasa: Jasa;

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

        try {
            jasa = await this.service.create(fixedNewData);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return jasa;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Jasa[]> {
        let data: Jasa[];
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

    // Getone method will return Jasa object or nul, so set return type as any.
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
        @Body() data: UpdateJasaDto,
        @Request() req: any,
    ): Promise<Jasa> {
        let jasa: Jasa;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.JasaWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            jasa = await this.service.update(q.where, data);
        } catch (error) {
            throw new NotFoundException(error);
        }
        return jasa;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<Jasa> {
        let jasa: Jasa;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.JasaWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            jasa = await this.service.remove(q.where);
        } catch {
            throw new NotFoundException();
        }

        return jasa;
    }
}

import { CreateMonitorTokoDtoV1 } from "./dto/create.monitor.toko.v1.dto";
import { UpdateMonitorTokoDtoV1 } from "./dto/update.monitor.toko.v1.dto";
import { MonitorTokoServiceV1 } from "./monitor.toko.service.v1";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { ParseUrlQuery } from "src/libs/string";
import { Prisma, MonitorToko } from "models";
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
@Controller({ version: "1", path: "monitor-toko" })
export class MonitorTokoControllerV1 {
    constructor(private readonly service: MonitorTokoServiceV1) {}

    @Post()
    async create(
        @Body() newData: CreateMonitorTokoDtoV1,
        @Request() req: any,
    ): Promise<MonitorToko> {
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
        let createdMonitorToko: MonitorToko;
        try {
            createdMonitorToko = await this.service.create(
                // Cleaned insert data
                this.service.cleanInsertData(newData),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return createdMonitorToko;
    }

    @Get()
    async findAll(
        @Query() query: any,
        @Request() req: any,
    ): Promise<MonitorToko[]> {
        let monitorToko: MonitorToko[];
        try {
            monitorToko = await this.service.findAll(
                this.service.secureQueries({
                    queries: ParseUrlQuery(query),
                    headers: req.user,
                }),
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return monitorToko;
    }

    // Getone method will return MonitorToko object or nul, so set return type as any.
    @Get(":username")
    async findOne(
        @Param("username") username: string,
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

                            // Timpa dengan where.username = yang ada pada URL parameter
                            // jadi, pada query di URL tidak perlu menambahkan where={"username": "some_username"}.
                            username,
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

    @Patch(":username")
    async update(
        @Param("username") username: string,
        @Body() data: UpdateMonitorTokoDtoV1,
        @Request() req: any,
    ): Promise<MonitorToko> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }

        let monitorToko: MonitorToko;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.MonitorTokoWhereUniqueInput>{
                    username,
                },
            },
            headers: req.user,
        });
        try {
            monitorToko = await this.service.update(
                q.where,
                this.service.cleanUpdateData(data),
            );
        } catch (error) {
            throw new NotFoundException(error);
        }
        return monitorToko;
    }

    @Delete(":username")
    async remove(
        @Param("username") username: string,
        @Request() req: any,
    ): Promise<MonitorToko> {
        let monitorToko: MonitorToko;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.MonitorTokoWhereUniqueInput>{
                    username,
                },
            },
            headers: req.user,
        });
        try {
            monitorToko = await this.service.remove(q.where);
        } catch {
            throw new NotFoundException();
        }
        return monitorToko;
    }
}

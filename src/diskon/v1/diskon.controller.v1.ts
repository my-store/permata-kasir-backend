import { CreateDiskonDtoV1 } from "./dto/create-diskon.dto.v1";
import { UpdateDiskonDtoV1 } from "./dto/update-diskon.dto.v1";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { DiskonServiceV1 } from "./diskon.service.v1";
import { ParseUrlQuery } from "src/libs/string";
import { Diskon, Prisma } from "models";
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

@UseGuards(AuthGuardV1)
@Controller({ version: "1", path: "diskon" })
export class DiskonControllerV1 {
    constructor(private readonly service: DiskonServiceV1) {}

    @Post()
    async create(
        @Body() newData: CreateDiskonDtoV1,
        @Request() req: any,
    ): Promise<Diskon> {
        let data: Diskon;

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
    async findAll(@Query() query: any, @Request() req: any): Promise<Diskon[]> {
        let data: Diskon[];
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

    // Getone method will return Diskon object or nul, so set return type as any.
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
        @Body() data: UpdateDiskonDtoV1,
        @Request() req: any,
    ): Promise<Diskon> {
        // No update data is presented
        if (!data || Object.keys(data).length < 1) {
            throw new BadRequestException("No data is presented!");
        }

        let diskon: Diskon;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.DiskonWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            diskon = await this.service.update(
                q.where,
                this.service.cleanUpdateData(data),
            );
        } catch (error) {
            throw new NotFoundException(error);
        }
        return diskon;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<Diskon> {
        let diskon: Diskon;
        const q: any = this.service.secureQueries({
            queries: {
                where: <Prisma.DiskonWhereUniqueInput>{
                    uuid,
                },
            },
            headers: req.user,
        });
        try {
            diskon = await this.service.remove(q.where);
        } catch (error) {
            throw new NotFoundException(error);
        }
        return diskon;
    }
}

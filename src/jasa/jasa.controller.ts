import { CreateJasaDto } from "./dto/create-jasa.dto";
import { UpdateJasaDto } from "./dto/update-jasa.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { JasaService } from "./jasa.service";
import { Prisma, Jasa } from "models";
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

@UseGuards(AuthGuard)
@Controller("api/jasa")
export class JasaController {
    constructor(private readonly service: JasaService) {}

    userGetQuery(q: any, tlp: string): any {
        let qx: any = { ...q };
        qx["where"] = {
            // If user spesified some where statement
            ...qx["where"],
            // For security reason, display onle member that owned by this user (who send the request)
            toko: {
                user: {
                    tlp, // Get by unique key
                },
            },
        };
        return qx;
    }

    @Post()
    async create(
        @Body() newData: CreateJasaDto,
        @Request() req: any,
    ): Promise<Jasa> {
        // Save inserted data into a variable, if not the server will shutdown when error occured.
        let jasa: Jasa;

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
        // If not removed, will cause error.
        const { userId, ...fixedNewData } = newData;

        try {
            jasa = await this.service.create(fixedNewData);
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
        return jasa;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Jasa[]> {
        let jasa: Jasa[];
        let q: any = { ...ParseUrlQuery(query) };

        // Data login admin/ user
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.userGetQuery(q, sub);
        }

        try {
            jasa = await this.service.findAll(q);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return jasa;
    }

    // Getone method will return Jasa object or nul, so set return type as any.
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Query() query: any,
        @Request() req: any,
    ): Promise<any> {
        let data: any;
        let q: any = { ...ParseUrlQuery(query) };

        // Data login admin/ user
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.userGetQuery(q, sub);
        }

        try {
            data = await this.service.findOne({
                ...q, // Other arguments (specified by user in URL)

                // Override user where statement (if exist)
                where: {
                    // Get one by some uuid (on URL as a parameter)
                    uuid,

                    // Also show only if this request come from the author
                    ...q["where"],
                },
            });
        } catch {
            throw new NotFoundException();
        }
        return data;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() updatedData: UpdateJasaDto,
        @Request() req: any,
    ): Promise<Jasa> {
        let jasa: Jasa;

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
        // If not removed, will cause error.
        const { userId, ...fixedupdatedData } = updatedData;

        try {
            jasa = await this.service.update({ uuid }, fixedupdatedData);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return jasa;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<Jasa> {
        let jasa: Jasa;

        // Where statement
        let where: Prisma.JasaWhereUniqueInput = {
            uuid,
        };

        // Data login admin/ user
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            where.toko = {
                // Pastikan si pengirim request ini adalah pemilik toko
                // dimana toko tersebut adalah pemilik jasa yang akan dihapus.
                user: {
                    tlp: sub,
                },
            };
        }

        try {
            jasa = await this.service.remove(where);
        } catch {
            throw new NotFoundException();
        }

        return jasa;
    }
}

import { CreateTokoDto } from "./dto/create-toko.dto";
import { UpdateTokoDto } from "./dto/update-toko.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { TokoService } from "./toko.service";
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

    userGetQuery(q: any, tlp: string): any {
        let qx: any = { ...q };
        qx["where"] = {
            // If user spesified some where statement
            ...qx["where"],
            // For security reason, display onle member that owned by this user (who send the request)
            user: {
                tlp, // Get by unique key
            },
        };
        return qx;
    }

    @Post()
    async create(
        @Body() newData: CreateTokoDto,
        @Request() req: any,
    ): Promise<Toko> {
        let toko: Toko;

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.inputOwnerCheck({
                ...req.user,
                userId: newData.userId,
            });
        } catch {
            throw new UnauthorizedException();
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
        let q: any = { ...ParseUrlQuery(query) };

        // Data login admin/ user
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.userGetQuery(q, sub);
        }

        try {
            data = await this.service.findAll(q);
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
        @Body() data: UpdateTokoDto,
        @Request() req: any,
    ): Promise<Toko> {
        let newData: Toko;

        // Data admin/ user yang sedang login
        const { sub, role } = req.user;

        // Database update where statement
        let where: Prisma.TokoWhereUniqueInput = {
            // No uuid toko yang akan di update datanya
            uuid,
        };

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            where.user = {
                // No tlp user yang terdeteksi pada headers
                tlp: sub,
            };
        }

        try {
            newData = await this.service.update({
                where,

                // Data yang telah dibersihkan dari kolom2 yang memang tidak boleh diubah.
                data: this.service.cleanUpdateData(data),
            });
        } catch {
            throw new NotFoundException();
        }

        return newData;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<Toko> {
        let deletedToko: Toko;

        // Data admin/ user yang sedang login
        const { sub, role } = req.user;

        // Database update where statement
        let where: Prisma.TokoWhereUniqueInput = {
            // No uuid toko yang akan di update datanya
            uuid,
        };

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            where.user = {
                // No tlp user yang terdeteksi pada headers
                tlp: sub,
            };
        }

        try {
            deletedToko = await this.service.remove(where);
        } catch {
            throw new NotFoundException();
        }

        return deletedToko;
    }
}

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

    modifyQueryForThisUser(q: any, tlp: string): any {
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

        // Hanya tampilkan data milik si user yang sedang login saja
        const { sub, role } = req.user;

        // Data baru yang akan di inputkan
        let fixedNewData: any = {
            ...newData,
        };

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Ubah argument pada data yang akan di inputkan
            fixedNewData.user = {
                // Hubungkan dengan user yang saat ini login dan mengirim request input ini
                connect: {
                    // Nomor telepon sebagaimana terdeteksi pada headers (sub)
                    tlp: sub,

                    // Pastikan juga user yang saat ini memiliki ID yang sama dengan userId yang di inputkan
                    // jika tidak sama, blokir request.
                    // Ini berguna supaya tidak sembarangan user membuat toko meng-atasnamakan user lain.
                    id: newData.userId,
                },
            };
        }

        try {
            toko = await this.service.create(fixedNewData);
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
        return toko;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Toko[]> {
        let data: Toko[];
        let q: any = { ...ParseUrlQuery(query) };

        // Hanya tampilkan data milik si user yang sedang login saja
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.modifyQueryForThisUser(q, sub);
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
        let getOneData: any;
        let q: any = { ...ParseUrlQuery(query) };

        // Hanya tampilkan data milik si user yang sedang login saja
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.modifyQueryForThisUser(q, sub);
        }

        try {
            getOneData = await this.service.findOne({
                ...q, // Other arguments (specified by user in URL)

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

        return getOneData;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() data: UpdateTokoDto,
        @Request() req: any,
    ): Promise<Toko> {
        let newData: Toko;

        // Hanya tampilkan data milik si user yang sedang login saja
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
            newData = await this.service.update({ where, data });
        } catch {
            throw new NotFoundException();
        }

        return newData;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        // @Request() req: any,
    ): Promise<Toko> {
        let deletedToko: Toko;

        try {
            deletedToko = await this.service.remove({ uuid });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return deletedToko;
    }
}

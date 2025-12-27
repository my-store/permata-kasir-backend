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

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.ownerCheck({
                ...req.user,
                userId: newData.userId,
            });
        } catch {
            throw new UnauthorizedException();
        }

        // Make sure to remove userId before insert, because that is only
        // for security checking.
        const { userId, ...fixedNewData } = newData;

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
    @Get(":tlp")
    async findOne(
        @Param("tlp") tlp: string,
        @Query() query: any,
        @Request() req: any,
    ): Promise<any> {
        let data: any;
        let q: any = { ...ParseUrlQuery(query) };

        // Hanya tampilkan data milik si user yang sedang login saja
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.modifyQueryForThisUser(q, sub);
        }

        try {
            data = await this.service.findOne({
                ...q, // Other arguments (specified by user in URL)

                where: {
                    // Get one by some tlp (on URL as a parameter)
                    tlp,

                    // Also show only if this request come from the author
                    ...q["where"],
                },
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updatedData: UpdateTokoDto,
        @Request() req: any,
    ): Promise<Toko> {
        let toko: Toko;

        // Check if this request is come from the owner, if not, block the request.
        try {
            await this.service.ownerCheck({
                ...req.user,
                userId: updatedData.userId,
            });
        } catch {
            throw new UnauthorizedException();
        }

        // Make sure to remove userId before insert, because that is only
        // for security checking.
        const { userId, ...fixedupdatedData } = updatedData;

        try {
            toko = await this.service.update(
                { id: parseInt(id) },
                fixedupdatedData,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return toko;
    }

    @Delete(":id")
    async remove(@Param("id") id: string): Promise<Toko> {
        let toko: Toko;
        try {
            toko = await this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return toko;
    }
}

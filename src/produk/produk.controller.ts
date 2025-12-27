import { CreateProdukDto } from "./dto/create-produk.dto";
import { UpdateProdukDto } from "./dto/update-produk.dto";
import { ProdukService } from "./produk.service";
import { AuthGuard } from "src/auth/auth.guard";
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

@UseGuards(AuthGuard)
@Controller("api/produk")
export class ProdukController {
    constructor(private readonly service: ProdukService) {}

    modifyQueryForThisUser(q: any, tlp: string): any {
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
        @Body() newData: CreateProdukDto,
        @Request() req: any,
    ): Promise<Produk> {
        // Save inserted data into a variable, if not the server will shutdown when error occured.
        let produk: Produk;

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
        const { userId, ...fixedNewData } = newData;

        try {
            produk = await this.service.create(fixedNewData);
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
        return produk;
    }

    @Get()
    async findAll(@Query() query: any, @Request() req: any): Promise<Produk[]> {
        let produk: Produk[];
        let q: any = { ...ParseUrlQuery(query) };

        // Hanya tampilkan data milik si user yang sedang login saja
        const { sub, role } = req.user;

        // Selain admin (siapapun), wajib melewati pengecekan dibawah
        if (role != "Admin") {
            // Modify where statement
            q = this.modifyQueryForThisUser(q, sub);
        }

        try {
            produk = await this.service.findAll(q);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return produk;
    }

    // Getone method will return Produk object or nul, so set return type as any.
    @Get(":id")
    async findOne(
        @Param("id") id: string,
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
                    // Get one by some id (on URL as a parameter)
                    id: parseInt(id),

                    // Also show only if this request come from the author
                    ...q["where"],
                },
            });
        } catch {
            throw new NotFoundException();
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updatedData: UpdateProdukDto,
        @Request() req: any,
    ): Promise<Produk> {
        let produk: Produk;

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
        const { userId, ...fixedupdatedData } = updatedData;

        try {
            produk = await this.service.update(
                { id: parseInt(id) },
                fixedupdatedData,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return produk;
    }

    @Delete(":id")
    async remove(@Param("id") id: string): Promise<Produk> {
        let produk: Produk;
        try {
            produk = await this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return produk;
    }
}

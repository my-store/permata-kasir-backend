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
    async findAll(@Query() query: any): Promise<Produk[]> {
        let produk: Produk[];
        try {
            produk = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return produk;
    }

    // Getone method will return Produk object or nul, so set return type as any.
    @Get(":id")
    async findOne(@Param("id") id: string, @Query() query: any): Promise<any> {
        let produk: any;
        try {
            produk = await this.service.findOne({
                where: { id: parseInt(id) },
                ...ParseUrlQuery(query),
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return produk;
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

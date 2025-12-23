import {
    InternalServerErrorException,
    BadRequestException,
    Controller,
    UseGuards,
    Delete,
    Param,
    Query,
    Patch,
    Body,
    Post,
    Get,
} from "@nestjs/common";
import { CreateProdukDto } from "./dto/create-produk.dto";
import { UpdateProdukDto } from "./dto/update-produk.dto";
import { ProdukService } from "./produk.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Prisma, Produk } from "models";

@UseGuards(AuthGuard)
@Controller("api/produk")
export class ProdukController {
    constructor(private readonly service: ProdukService) {}

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

    @Post()
    async create(@Body() createProdukDto: CreateProdukDto): Promise<Produk> {
        // Save inserted data into a variable, if not the server will shutdown when error occured.
        let produk: Produk;
        try {
            produk = await this.service.create(createProdukDto);
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

    // Getone method will return Produk object or nul, so set return type as any.
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<any> {
        let produk: any;
        try {
            produk = await this.service.findOne({
                where: { id: parseInt(id) },
            });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return produk;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updateProdukDto: UpdateProdukDto,
    ): Promise<Produk> {
        let produk: Produk;
        try {
            produk = await this.service.update(
                { id: parseInt(id) },
                updateProdukDto,
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

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
    Request,
    UnauthorizedException,
} from "@nestjs/common";
import { CreateProdukDto } from "./dto/create-produk.dto";
import { UpdateProdukDto } from "./dto/update-produk.dto";
import { UserService } from "src/user/user.service";
import { ProdukService } from "./produk.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Prisma, Produk } from "models";

@UseGuards(AuthGuard)
@Controller("api/produk")
export class ProdukController {
    constructor(
        private readonly service: ProdukService,
        private readonly userService: UserService,
    ) {}

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

        // Get the user role and tlp (sub) from Authorization headers.
        const { sub, role } = req.user;

        // Inputed by admin (block this)
        if (role == "Admin") throw new UnauthorizedException();

        // Get the user data
        try {
            const user: any = await this.userService.findOne({
                where: { tlp: sub },
            });
            // Make this input request is come from the owner
            if (user.id != updatedData.userId) {
                // It it's not, block it!
                throw new UnauthorizedException();
            }
        } catch (error) {
            // Maybe user is deleted, or something else
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

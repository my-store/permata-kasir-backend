import {
    InternalServerErrorException,
    Controller,
    UseGuards,
    Delete,
    Param,
    Query,
    Patch,
    Post,
    Body,
    Get,
    BadRequestException,
} from "@nestjs/common";
import { CreateTokoDto } from "./dto/create-toko.dto";
import { UpdateTokoDto } from "./dto/update-toko.dto";
import { TokoService } from "./toko.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Prisma, Toko } from "models";

@UseGuards(AuthGuard)
@Controller("api/toko")
export class TokoController {
    constructor(private readonly service: TokoService) {}

    @Get()
    async findAll(@Query() query: any): Promise<Toko[]> {
        let data: Toko[];
        try {
            data = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Post()
    async create(@Body() createTokoDto: CreateTokoDto): Promise<Toko> {
        let toko: Toko;
        try {
            toko = await this.service.create(createTokoDto);
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

    // Getone method will return Admin object or nul, so set return type as any.
    @Get(":tlp")
    async findOne(@Param("tlp") tlp: string): Promise<any> {
        let data: any;
        try {
            data = await this.service.findOne({ where: { tlp } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updatedData: UpdateTokoDto,
    ): Promise<Toko> {
        let toko: Toko;
        try {
            toko = await this.service.update({ id: parseInt(id) }, updatedData);
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

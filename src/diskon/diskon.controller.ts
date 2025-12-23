import { CreateDiskonDto } from "./dto/create-diskon.dto";
import { UpdateDiskonDto } from "./dto/update-diskon.dto";
import { DiskonService } from "./diskon.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ParseUrlQuery } from "src/libs/string";
import { Diskon, Prisma } from "models";
import {
    InternalServerErrorException,
    BadRequestException,
    Controller,
    UseGuards,
    Delete,
    Param,
    Query,
    Patch,
    Post,
    Body,
    Get,
} from "@nestjs/common";

@UseGuards(AuthGuard)
@Controller("api/diskon")
export class DiskonController {
    constructor(private readonly service: DiskonService) {}

    @Get()
    async findAll(@Query() query: any): Promise<Diskon[]> {
        let data: Diskon[];
        try {
            data = await this.service.findAll(ParseUrlQuery(query));
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Post()
    async create(@Body() createDiskonDto: CreateDiskonDto): Promise<Diskon> {
        let diskon: Diskon;
        try {
            diskon = await this.service.create(createDiskonDto);
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
        return diskon;
    }

    // Getone method will return Admin object or nul, so set return type as any.
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<any> {
        let data: any;
        try {
            data = await this.service.findOne({ where: { id: parseInt(id) } });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return data;
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updateDiskonDto: UpdateDiskonDto,
    ): Promise<Diskon> {
        let diskon: Diskon;
        try {
            diskon = await this.service.update(
                { id: parseInt(id) },
                updateDiskonDto,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return diskon;
    }

    @Delete(":id")
    async remove(@Param("id") id: string): Promise<Diskon> {
        let diskon: Diskon;
        try {
            diskon = await this.service.remove({ id: parseInt(id) });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return diskon;
    }
}

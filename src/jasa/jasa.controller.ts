import { CreateJasaDto } from "./dto/create-jasa.dto";
import { UpdateJasaDto } from "./dto/update-jasa.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { JasaService } from "./jasa.service";
import {
    Controller,
    UseGuards,
    Delete,
    Patch,
    Param,
    Post,
    Body,
    Get,
} from "@nestjs/common";

@UseGuards(AuthGuard)
@Controller("api/jasa")
export class JasaController {
    constructor(private readonly jasaService: JasaService) {}

    @Post()
    create(@Body() createJasaDto: CreateJasaDto) {
        return this.jasaService.create(createJasaDto);
    }

    @Get()
    findAll() {
        return this.jasaService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.jasaService.findOne(+id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateJasaDto: UpdateJasaDto) {
        return this.jasaService.update(+id, updateJasaDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.jasaService.remove(+id);
    }
}

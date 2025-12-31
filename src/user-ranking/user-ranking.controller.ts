import {
    Controller,
    Delete,
    Query,
    Param,
    Patch,
    Post,
    Body,
    Get,
} from "@nestjs/common";
import { CreateUserRankingDto } from "./dto/create-user-ranking.dto";
import { UpdateUserRankingDto } from "./dto/update-user-ranking.dto";
import { UserRankingService } from "./user-ranking.service";
import { ParseUrlQuery } from "src/libs/string";

@Controller("user-ranking")
export class UserRankingController {
    constructor(private readonly userRankingService: UserRankingService) {}

    @Post()
    create(@Body() createUserRankingDto: CreateUserRankingDto) {
        return this.userRankingService.create(createUserRankingDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.userRankingService.findAll(ParseUrlQuery(query));
    }

    @Get(":uuid")
    findOne(@Param("uuid") uuid: string) {
        return this.userRankingService.findOne({ where: { uuid } });
    }

    @Patch(":uuid")
    update(@Param("uuid") uuid: string, @Body() data: UpdateUserRankingDto) {
        return this.userRankingService.update({ uuid }, data);
    }

    @Delete(":uuid")
    remove(@Param("uuid") uuid: string) {
        return this.userRankingService.remove({ uuid });
    }
}

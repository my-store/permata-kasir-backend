import { CreateUserRankingDto } from "./dto/create-user-ranking.dto";
import { UpdateUserRankingDto } from "./dto/update-user-ranking.dto";
import { UserRankingService } from "./user-ranking.service";
import { ParseUrlQuery } from "src/libs/string";
import { AuthGuard } from "src/auth/auth.guard";
import {
    UnauthorizedException,
    Controller,
    UseGuards,
    Request,
    Delete,
    Query,
    Param,
    Patch,
    Post,
    Body,
    Get,
    InternalServerErrorException,
} from "@nestjs/common";
import { UserRanking } from "models";

@UseGuards(AuthGuard)
@Controller("api/user-ranking")
export class UserRankingController {
    constructor(private readonly userRankingService: UserRankingService) {}

    @Post()
    async create(
        @Body() data: CreateUserRankingDto,
        @Request() req: any,
    ): Promise<UserRanking> {
        const { sub, role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRanking: UserRanking;
        try {
            userRanking = await this.userRankingService.create({
                ...data,
                admin: {
                    connect: {
                        tlp: sub,
                    },
                },
            });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return userRanking;
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

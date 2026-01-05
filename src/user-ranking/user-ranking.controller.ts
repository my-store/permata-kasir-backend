import { CreateUserRankingDto } from "./dto/create-user-ranking.dto";
import { UpdateUserRankingDto } from "./dto/update-user-ranking.dto";
import { UserRankingService } from "./user-ranking.service";
import { ParseUrlQuery } from "src/libs/string";
import { AuthGuard } from "src/auth/auth.guard";
import { UserRanking } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
    NotFoundException,
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
} from "@nestjs/common";

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
    async findAll(
        @Query() query: any,
        @Request() req: any,
    ): Promise<UserRanking[]> {
        const { role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRanking: UserRanking[];
        try {
            userRanking = await this.userRankingService.findAll(
                ParseUrlQuery(query),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return userRanking;
    }

    // Getone method will return UserRanking object or nul, so set return type as any.
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<any> {
        const { role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRanking: any;
        try {
            userRanking = await this.userRankingService.findOne({
                where: { uuid },
            });
        } catch {
            throw new NotFoundException();
        }
        return userRanking;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() data: UpdateUserRankingDto,
        @Request() req: any,
    ): Promise<UserRanking> {
        const { sub, role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRanking: UserRanking;
        try {
            userRanking = await this.userRankingService.update(
                {
                    uuid,
                    admin: {
                        tlp: sub,
                    },
                },
                this.userRankingService.cleanUpdateData(data),
            );
        } catch {
            throw new NotFoundException();
        }
        return userRanking;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<UserRanking> {
        const { sub, role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRanking: UserRanking;
        try {
            userRanking = await this.userRankingService.remove({
                uuid,
                admin: { tlp: sub },
            });
        } catch {
            throw new NotFoundException();
        }
        return userRanking;
    }
}

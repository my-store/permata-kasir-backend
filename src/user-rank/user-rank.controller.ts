import { CreateUserRankDto } from "./dto/create-user-rank.dto";
import { UpdateUserRankDto } from "./dto/update-user-rank.dto";
import { UserRankService } from "./user-rank.service";
import { ParseUrlQuery } from "src/libs/string";
import { AuthGuard } from "src/auth/auth.guard";
import { UserRank } from "models";
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
@Controller("api/user-rank")
export class UserRankController {
    constructor(private readonly userRankService: UserRankService) {}

    @Post()
    async create(
        @Body() data: CreateUserRankDto,
        @Request() req: any,
    ): Promise<UserRank> {
        const { sub, role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRank: UserRank;
        try {
            userRank = await this.userRankService.create({
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
        return userRank;
    }

    @Get()
    async findAll(
        @Query() query: any,
        @Request() req: any,
    ): Promise<UserRank[]> {
        const { role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRank: UserRank[];
        try {
            userRank = await this.userRankService.findAll(ParseUrlQuery(query));
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return userRank;
    }

    // Getone method will return UserRank object or nul, so set return type as any.
    @Get(":uuid")
    async findOne(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<any> {
        const { role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRank: any;
        try {
            userRank = await this.userRankService.findOne({
                where: { uuid },
            });
        } catch {
            throw new NotFoundException();
        }
        return userRank;
    }

    @Patch(":uuid")
    async update(
        @Param("uuid") uuid: string,
        @Body() data: UpdateUserRankDto,
        @Request() req: any,
    ): Promise<UserRank> {
        const { sub, role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRank: UserRank;
        try {
            userRank = await this.userRankService.update(
                {
                    uuid,
                    admin: {
                        tlp: sub,
                    },
                },
                this.userRankService.cleanUpdateData(data),
            );
        } catch {
            throw new NotFoundException();
        }
        return userRank;
    }

    @Delete(":uuid")
    async remove(
        @Param("uuid") uuid: string,
        @Request() req: any,
    ): Promise<UserRank> {
        const { sub, role } = req.user;
        if (role != "Admin") {
            throw new UnauthorizedException();
        }
        let userRank: UserRank;
        try {
            userRank = await this.userRankService.remove({
                uuid,
                admin: { tlp: sub },
            });
        } catch {
            throw new NotFoundException();
        }
        return userRank;
    }
}

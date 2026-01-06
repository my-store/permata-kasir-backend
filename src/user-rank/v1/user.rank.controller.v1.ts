import { CreateUserRankDtoV1 } from "./dto/create.user.rank.v1.dto";
import { UpdateUserRankDtoV1 } from "./dto/update.user.rank.v1.dto";
import { UserRankServiceV1 } from "./user.rank.service.v1";
import { AuthGuardV1 } from "src/auth/v1/auth.guard.v1";
import { ParseUrlQuery } from "src/libs/string";
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

@UseGuards(AuthGuardV1)
@Controller({ version: "1", path: "user-rank" })
export class UserRankControllerV1 {
    constructor(private readonly userRankService: UserRankServiceV1) {}

    @Post()
    async create(
        @Body() data: CreateUserRankDtoV1,
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
        @Body() data: UpdateUserRankDtoV1,
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

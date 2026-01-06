import { AuthRefreshDtoV1, AuthLoginDtoV1 } from "./dto/auth.dto.v1";
import { AuthServiceV1 } from "./auth.service.v1";
import { AuthGuardV1 } from "./auth.guard.v1";
import {
    Controller,
    UseGuards,
    Request,
    Body,
    Post,
    Get,
} from "@nestjs/common";

@Controller({ version: "1", path: "auth" })
export class AuthControllerV1 {
    constructor(private service: AuthServiceV1) {}

    @Post()
    signIn(@Body() signInDto: AuthLoginDtoV1) {
        return this.service.signIn(signInDto.tlp, signInDto.pass);
    }

    @Post("refresh")
    refreshToken(@Body() data: AuthRefreshDtoV1) {
        return this.service.refresh(data.tlp);
    }

    // PROTECTED ROUTE
    @UseGuards(AuthGuardV1)
    @Get()
    getProfile(@Request() req) {
        return req.user;
    }
}

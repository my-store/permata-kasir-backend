import { Controller, Request, Body, Post, Get } from "@nestjs/common";
import { AuthRefreshDtoV1, AuthLoginDtoV1 } from "./dto/auth.dto.v1";
import { AuthServiceV1 } from "./auth.service.v1";
import { Public } from "./auth.bypass";

@Controller({ version: "1", path: "auth" })
export class AuthControllerV1 {
    constructor(private service: AuthServiceV1) {}

    // PUBLIC ROUTE
    @Public()
    @Post()
    signIn(@Body() loginData: AuthLoginDtoV1) {
        return this.service.signIn(loginData);
    }

    // PUBLIC ROUTE
    @Public()
    @Post("refresh")
    refreshToken(@Body() data: AuthRefreshDtoV1) {
        return this.service.refresh({ refreshData: data });
    }

    @Get()
    getProfile(@Request() req: any) {
        return req.user;
    }
}

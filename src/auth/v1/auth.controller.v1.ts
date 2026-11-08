import {
    UnauthorizedException,
    Controller,
    Request,
    Body,
    Post,
    Get,
} from "@nestjs/common";
import {
    AuthLoginDataDataDtoV1,
    AuthRefreshDtoV1,
    AuthLoginDtoV1,
} from "./dto/auth.dto.v1";
import { AuthServiceV1 } from "./auth.service.v1";
import { Public } from "./auth.bypass.v1";

@Controller({ version: "1", path: "auth" })
export class AuthControllerV1 {
    constructor(private service: AuthServiceV1) {}

    decryptB64(data: string): string {
        return Buffer.from(data, "base64").toString();
    }

    decryptHex(data: string): string {
        return Buffer.from(data, "hex").toString();
    }

    reverse(data: string): string {
        return data.split("").reverse().join("");
    }

    decryptPayload(loginData: any): AuthLoginDataDataDtoV1 {
        /*
        |   -----------------------------------------
        |   DECRYPTION
        |   -----------------------------------------
        |   1. Reverse the hex
        |   2. Convert from hex to base64
        |   3. Reverse the base64
        |   4. Convert from base64 to utf-8
        |   -----------------------------------------
        |   Catatan:
        |   Login data adalah string "hex" yang telah dibalik/ reverse
        */
        let data: any;
        try {
            const _hex: string = this.decryptHex(this.reverse(loginData));
            const _b64: string = this.decryptB64(this.reverse(_hex));
            data = JSON.parse(_b64);
        } catch (error) {
            throw new UnauthorizedException();
        }

        // Data is not valid
        const notValid: boolean = !data.tlp || !data.password || !data.app_name;
        if (notValid) {
            throw new UnauthorizedException();
        }

        return data;
    }

    // PUBLIC ROUTE
    @Public()
    @Post()
    signIn(@Body() loginData: AuthLoginDtoV1) {
        return this.service.signIn(this.decryptPayload(loginData.data));
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

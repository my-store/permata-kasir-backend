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

    decryptPayload(loginData: any): AuthLoginDataDataDtoV1 {
        // Return encripted data value, for testing only
        // return Buffer.from(JSON.stringify(loginData), "utf-8").toString("hex");

        let data: any;
        try {
            const decryptedHex: string = this.decryptHex(loginData);
            const decryptedB64: string = this.decryptB64(decryptedHex);
            const reversedDecrypted: string = decryptedB64
                .split("")
                .reverse()
                .join("");
            data = JSON.parse(reversedDecrypted);
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

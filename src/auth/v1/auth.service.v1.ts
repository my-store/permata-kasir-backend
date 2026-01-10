import { AdminServiceV1 } from "../../admin/v1/admin.service.v1";
import { KasirServiceV1 } from "src/kasir/v1/kasir.service.v1";
import { UserServiceV1 } from "../../user/v1/user.service.v1";
import { AuthRefreshDtoV1 } from "./dto/auth.dto.v1";
import { Admin, Kasir, User } from "models/client";
import { generateId } from "src/libs/string";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
    InternalServerErrorException,
    UnauthorizedException,
    Injectable,
} from "@nestjs/common";

interface FindAccountInterface {
    data: Admin | User | Kasir;
    role: string;
}

interface JWTResponseInterface {
    access_token: string;
    refresh_token: string;
    role: string;
}

interface RefreshTokenDataInterface {
    // Dari header.user
    role: string; // Admin | User | Kasir
    sub: string; // No. Tlp

    // Dari request body
    tokenData: AuthRefreshDtoV1;
}

@Injectable()
export class AuthServiceV1 {
    constructor(
        private readonly admin: AdminServiceV1,
        private readonly user: UserServiceV1,
        private readonly kasir: KasirServiceV1,
        private readonly jwt: JwtService,
    ) {}

    async findAccount(tlp: string): Promise<FindAccountInterface> {
        let data: any;
        let role: string = "";

        // Try find admin first
        try {
            data = await this.admin.findOne({ where: { tlp } });
            role = "Admin";
        } catch {}

        // Admin not found, try find User
        if (!data) {
            try {
                data = await this.user.findOne({ where: { tlp } });
                role = "User";
            } catch {}
        }

        // User not found, try find kasir
        if (!data) {
            try {
                data = await this.kasir.findOne({ where: { tlp } });
                role = "Kasir";
            } catch {}
        }

        // The kasir also not found
        if (!data) {
            // Terminate task
            throw new UnauthorizedException();
        }

        return { data, role };
    }

    async signIn(tlp: string, pass: string): Promise<JWTResponseInterface> {
        const { data, role }: any = await this.findAccount(tlp);

        // Admin, User and Kasir not found
        if (!data || role.length < 1) {
            // Terminate task
            throw new UnauthorizedException("Akun tidak ditemukan!");
        }

        // Compare password
        const correctPassword = bcrypt.compareSync(pass, data.password);

        // Wrong password
        if (!correctPassword) {
            throw new UnauthorizedException("Password salah!");
        }

        // Check for active account (User & Kasir)
        if (role == "User" || role == "Kasir") {
            this.checkActiveAccount(role, data);
        }

        // Return created token & refresh-token
        return this.createJwt(data, role);
    }

    checkActiveAccount(role: string, data: any) {
        // Blocked | banned account | not activated yet
        if (!data.active) {
            // Blocked or banned
            if (data.deactivatedAt && data.deactivatedAt.length > 0) {
                // Terminate task
                throw new UnauthorizedException(
                    `Akun anda telah di blokir, karena:\n${data.deactivatedReason}`,
                );
            }

            // Not activated (make sure deactivatedAt is empty string)
            else {
                let msg: string =
                    "Akun anda belum di aktivasi, silahkan menghubungi ";

                switch (role) {
                    // Jika yang login adalah kasir
                    case "Kasir":
                        msg += "pemilik toko";
                        break;
                    // Jika yang login adalah user
                    default:
                        msg += "admin";
                }

                // Terminate task, and display the message
                throw new UnauthorizedException(msg);
            }
        }
    }

    async createJwt(
        person: Admin | User | Kasir,
        role: string,
    ): Promise<JWTResponseInterface> {
        // User Payload
        const payload = { sub: person.tlp, role };

        // JSON Web Token
        const access_token = await this.jwt.signAsync(payload);

        // Get refresh-token length (Look at .env file)
        const rtLentgh: any = process.env.APP_AUTH_REFRESH_TOKEN_LENGTH;
        // Parse refresh-token length to insteger
        // and then use it for generate random ID.
        const refresh_token = generateId(parseInt(rtLentgh));

        // Create refresh-token
        let refreshTokenCreated: boolean = false;
        switch (role) {
            case "Admin":
                try {
                    await this.admin.createToken(person.tlp, {
                        token: access_token,
                        refreshToken: refresh_token,
                    });
                    refreshTokenCreated = true;
                } catch {}
                break;

            case "User":
                try {
                    await this.user.createToken(person.tlp, {
                        token: access_token,
                        refreshToken: refresh_token,
                    });
                    refreshTokenCreated = true;
                } catch {}
                break;

            case "Kasir":
                try {
                    await this.kasir.createToken(person.tlp, {
                        token: access_token,
                        refreshToken: refresh_token,
                    });
                    refreshTokenCreated = true;
                } catch {}
                break;
        }

        // Refresh token creation failed
        if (!refreshTokenCreated) {
            throw new InternalServerErrorException(
                "Gagal membuat refresh-token!",
            );
        }

        return { access_token, refresh_token, role };
    }

    /* ==============================================================
    |  PEMBUATAN TOKEN BARU - SETELAH KADALUARSA
    |  ==============================================================
    |  Disini akan dilakukan pengecekan pada database token,
    |  jika data tidak benar, blokir permintaan refresh token.
    |  --------------------------------------------------------------
    */
    async refresh(params: {
        refreshData: RefreshTokenDataInterface;
    }): Promise<JWTResponseInterface> {
        const { refreshData } = params;

        // No refresh data is presented
        if (!refreshData.sub || !refreshData.role) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // Ambil data user/admin
        const { data, role }: any = await this.findAccount(refreshData.sub);

        // Admin, User and Kasir not found
        if (!data) {
            // Terminate task
            throw new UnauthorizedException("Akun tidak ditemukan!");
        }

        // Check for active account (User & Kasir)
        if (role == "User" || role == "Kasir") {
            this.checkActiveAccount(role, data);
        }

        // Security check passed state
        let passed: boolean = false;

        // Token data { token, refresh_token }
        const { tokenData } = refreshData;

        // Mencari refresh-token
        switch (role) {
            case "Admin":
                try {
                    await this.admin.findToken({
                        where: {
                            token: tokenData.token,
                            refreshToken: tokenData.refresh_token,
                        },
                    });
                    passed = true;
                } catch {}
                break;

            case "User":
                try {
                    // Cari token
                    await this.user.findToken({
                        where: {
                            token: tokenData.token,
                            refreshToken: tokenData.refresh_token,
                        },
                    });
                    passed = true;
                } catch {}
                break;

            case "Kasir":
                try {
                    await this.kasir.findToken({
                        where: {
                            token: tokenData.token,
                            refreshToken: tokenData.refresh_token,
                        },
                    });
                    passed = true;
                } catch {}
                break;
        }

        // Security check failed
        if (!passed) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // Buat token baru
        return this.createJwt(data, role);
    }
}

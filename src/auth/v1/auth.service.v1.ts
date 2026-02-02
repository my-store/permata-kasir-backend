import { KasirRefreshTokenServiceV1 } from "src/kasir/v1/kasir.refresh.token.service.v1";
import { AdminRefreshTokenServiceV1 } from "src/admin/v1/admin.refresh.token.service.v1";
import { UserRefreshTokenServiceV1 } from "src/user/v1/user.refresh.token.service.v1";
import { AdminServiceV1 } from "../../admin/v1/admin.service.v1";
import { KasirServiceV1 } from "src/kasir/v1/kasir.service.v1";
import { UserServiceV1 } from "../../user/v1/user.service.v1";
import { AuthRefreshDtoV1 } from "./dto/auth.dto.v1";
import {
    AdminRefreshToken,
    KasirRefreshToken,
    UserRefreshToken,
    Kasir,
    Admin,
    User,
} from "models/client";
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

@Injectable()
export class AuthServiceV1 {
    constructor(
        private readonly admin: AdminServiceV1,
        private readonly adminRefreshToken: AdminRefreshTokenServiceV1,

        private readonly user: UserServiceV1,
        private readonly userRefreshToken: UserRefreshTokenServiceV1,

        private readonly kasir: KasirServiceV1,
        private readonly kasirRefreshToken: KasirRefreshTokenServiceV1,

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
            throw new UnauthorizedException("Akun tidak ditemukan!");
        }

        return { data, role };
    }

    /* =======================================================
    |  HAPUS TOKEN & REFRESH-TOKEN LAMA
    |  =======================================================
    |  Refresh token akan menumpuk jika tidak dilakukan 
    |  penghapusan secara rutin, oleh karena itu kita hapus
    |  seluruh token ketika client akan login kembali.
    |*/
    async removeOldToken(role: string, tlp: string): Promise<any> {
        switch (role) {
            case "Admin":
                try {
                    // Ambil seluruh refresh-token
                    const adminRT: AdminRefreshToken[] =
                        await this.adminRefreshToken.findAll({
                            where: {
                                admin: {
                                    tlp,
                                },
                            },
                        });
                    // Jika ada, hapus semua
                    if (adminRT.length > 0) {
                        // Ambil seluruh ID pada token yang akan dihapus
                        const ids: number[] = adminRT.map((x) => x.id);
                        // Hapus seluruh token
                        try {
                            await this.adminRefreshToken.removeMany(ids);
                        } catch (err) {
                            throw new InternalServerErrorException(err);
                        }
                    }
                } catch {}
                break;

            case "User":
                try {
                    // Ambil seluruh refresh-token
                    const userRT: UserRefreshToken[] =
                        await this.userRefreshToken.findAll({
                            where: {
                                user: {
                                    tlp,
                                },
                            },
                        });
                    // Jika ada, hapus semua
                    if (userRT.length > 0) {
                        // Ambil seluruh ID pada token yang akan dihapus
                        const ids: number[] = userRT.map((x) => x.id);
                        // Hapus seluruh token
                        try {
                            await this.userRefreshToken.removeMany(ids);
                        } catch (err) {
                            throw new InternalServerErrorException(err);
                        }
                    }
                } catch {}
                break;

            case "Kasir":
                try {
                    // Ambil seluruh refresh-token
                    const kasirRT: KasirRefreshToken[] =
                        await this.kasirRefreshToken.findAll({
                            where: {
                                kasir: {
                                    tlp,
                                },
                            },
                        });
                    // Jika ada, hapus semua
                    if (kasirRT.length > 0) {
                        // Ambil seluruh ID pada token yang akan dihapus
                        const ids: number[] = kasirRT.map((x) => x.id);
                        // Hapus seluruh token
                        try {
                            await this.kasirRefreshToken.removeMany(ids);
                        } catch (err) {
                            throw new InternalServerErrorException(err);
                        }
                    }
                } catch {}
                break;
        }
    }

    async signIn(params: {
        tlp: string;
        password: string;
        app_name: string;
    }): Promise<JWTResponseInterface> {
        const { tlp, password, app_name } = params;

        /* --------------------------------------------------
        |  Check if login are from valid Permata Kasir app
        |  --------------------------------------------------
        |  1. Desktop
        |  2. Mobile
        |  3. RestAPI (Postman, Bruno, etc)
        */
        const restAppName: string = "Permata-Kasir-Client-RestAPI";
        const mobileAppName: string = "Permata-Kasir-Client-Mobile";
        const desktopAppName: string = "Permata-Kasir-Client-Desktop";
        const validApp: boolean =
            app_name == desktopAppName ||
            app_name == mobileAppName ||
            app_name == restAppName;

        // Unknown client
        if (!validApp) {
            // Terminate task
            throw new UnauthorizedException("Missing app_name");
        }

        // Cari data Admin, User atau Kasir
        const { data, role }: any = await this.findAccount(tlp);

        // Compare password
        const correctPassword = bcrypt.compareSync(password, data.password);

        // Wrong password
        if (!correctPassword) {
            throw new UnauthorizedException("Password salah!");
        }

        // Pengecekan apakah akun aktif (User & Kasir)
        if (role == "User" || role == "Kasir") {
            this.checkActiveAccount(role, data);
        }

        // Pengecekan admin
        else {
            // Blokir admin dari login menggunakan aplikasi desktop atau mobile.
            if (app_name == mobileAppName || app_name == desktopAppName) {
                // Terminate task
                throw new UnauthorizedException(
                    "Admin tidak di izinkan menggunakan aplikasi ini!",
                );
            }
        }

        // Return created token & refresh-token
        return this.createJwt(data, role);
    }

    checkActiveAccount(role: string, data: any) {
        /* ============================================
        |  REMEMBER
        |  ============================================
        |  These fields are nullabel, even if they are
        |  have string value type on database, they
        |  can be null if the value is not setted.
        |  --------------------------------------------
        |  1. deactivatedAt
        |  2. deactivatedReason
        */
        // Blocked | banned account | not activated yet
        if (!data.active) {
            // Blocked or banned
            if (data.deactivatedAt) {
                // Deactivation message
                let msg: string = "Akun anda telah di blokir";

                // Deactivated with reason
                if (data.deactivatedReason) {
                    // Add the reason message
                    msg += `, karena:\n${data.deactivatedReason}`;
                }

                // Terminate task & display the deactivation message
                throw new UnauthorizedException(msg);
            }

            // Not activated
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
        // User Payload (semakin banyak fileds, semakin banyak/ panjang jumlah token)
        const payload: any = { sub: person.tlp, role, uuid: person.uuid };

        // JSON Web Token
        const access_token = await this.jwt.signAsync(payload);

        // Get refresh-token length (Look at .env file)
        const rtLentgh: any = process.env.APP_AUTH_REFRESH_TOKEN_LENGTH;
        // Parse refresh-token length to insteger
        // and then use it for generate random ID.
        const refresh_token = generateId(parseInt(rtLentgh));

        // Hapus token lama
        await this.removeOldToken(role, person.tlp);

        // Create refresh-token
        let refreshTokenCreated: boolean = false;
        switch (role) {
            case "Admin":
                // Pembuatan token baru admin
                try {
                    await this.adminRefreshToken.create(person.tlp, {
                        token: access_token,
                        refreshToken: refresh_token,
                    });
                    // Token baru berhasil dibuat
                    refreshTokenCreated = true;
                } catch (err) {
                    // Gagal membuat token baru
                    throw new InternalServerErrorException(err);
                }
                break;

            case "User":
                // Pembuatan token baru user
                try {
                    await this.userRefreshToken.create(person.tlp, {
                        token: access_token,
                        refreshToken: refresh_token,
                    });
                    // Token baru berhasil dibuat
                    refreshTokenCreated = true;
                } catch (err) {
                    // Gagal membuat token baru
                    throw new InternalServerErrorException(err);
                }
                break;

            case "Kasir":
                // Pembuatan token baru kasir
                try {
                    await this.kasirRefreshToken.create(person.tlp, {
                        token: access_token,
                        refreshToken: refresh_token,
                    });
                    // Token baru berhasil dibuat
                    refreshTokenCreated = true;
                } catch (err) {
                    // Gagal membuat token baru
                    throw new InternalServerErrorException(err);
                }
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
        refreshData: AuthRefreshDtoV1;
    }): Promise<JWTResponseInterface> {
        const { refreshData } = params;

        // Cari data Admin, User atau Kasir
        const { data, role }: any = await this.findAccount(refreshData.tlp);

        // Check for active account (User & Kasir)
        if (role == "User" || role == "Kasir") {
            this.checkActiveAccount(role, data);
        }

        // Security check passed state
        let passed: boolean = false;

        // Mencari refresh-token
        switch (role) {
            case "Admin":
                try {
                    await this.adminRefreshToken.findOne({
                        where: {
                            token: refreshData.access_token,
                            refreshToken: refreshData.refresh_token,
                        },
                    });
                    passed = true;
                } catch {}
                break;

            case "User":
                try {
                    // Cari token
                    await this.userRefreshToken.findOne({
                        where: {
                            token: refreshData.access_token,
                            refreshToken: refreshData.refresh_token,
                        },
                    });
                    passed = true;
                } catch (err) {}
                break;

            case "Kasir":
                try {
                    await this.kasirRefreshToken.findOne({
                        where: {
                            token: refreshData.access_token,
                            refreshToken: refreshData.refresh_token,
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

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { KasirServiceV1 } from "./kasir/v1/kasir.service.v1";
import { AdminServiceV1 } from "./admin/v1/admin.service.v1";
import { UserServiceV1 } from "./user/v1/user.service.v1";
import { Admin, User, Kasir } from "models/client";
import { IsNumber } from "./libs/string";
import { join } from "path";

@Injectable()
export class AppService {
    constructor(
        private readonly admin: AdminServiceV1,
        private readonly user: UserServiceV1,
        private readonly kasir: KasirServiceV1,
    ) {}

    async updateOnlineStatus(
        tlp: string,
        role: string,
        newData: any,
    ): Promise<Admin | User | Kasir> {
        let updatedData: any = null;

        // Update admin
        if (role == "Admin") {
            try {
                updatedData = await this.admin.update({ tlp }, newData);
            } catch {}
        }

        // Update User
        if (role == "User") {
            try {
                updatedData = await this.user.update({ tlp }, newData);
            } catch {}
        }

        // Update Kasir
        if (role == "Kasir") {
            try {
                updatedData = await this.kasir.update({ tlp }, newData);
            } catch {}
        }

        // An error occured while updating data
        if (!updatedData) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // Updated data
        return updatedData;
    }

    async login(tlp: string, role: string): Promise<Admin | User | Kasir> {
        return this.updateOnlineStatus(tlp, role, { online: true });
    }

    async logout(tlp: string, role: string): Promise<Admin | User | Kasir> {
        return this.updateOnlineStatus(tlp, role, {
            online: false,
            lastOnline: new Date().toISOString(),
        });
    }

    updateEnv(k: string, nv: string): [boolean, string] {
        // Lokasi file .env
        const envLoc: string = join(__dirname, "..", ".env");

        // Buka isi file .env
        const env: string = readFileSync(envLoc, "utf-8");

        // Ubah isi .env (yang telah dibaca didalam RAM) ke array
        const arrEnv = env.split("\n");

        // Cari data yang akan diubah
        const data = arrEnv.filter((v) => {
            // Menggunakan metode regex untuk mencari data berdasarkan key yang dikirim (pada parameter key)
            const z = new RegExp(k, "gi").test(v);
            // Jika data ditemukan
            if (z) {
                // Kembalian data yang ditemukan dan hentikan filter loop
                return z;
            }
        });

        // Data ditemukan
        if (data.length > 0) {
            // Nilai lama
            const oldData: string = data[0].trim();

            // Nilai baru
            const newData: string =
                oldData.split("=")[0] +
                // Jika dia angka, tidak boleh menggunakan double-qoutes
                `=${IsNumber(nv) ? nv : `"${nv}"`}`;

            // Backup .env lama
            copyFileSync(envLoc, `${envLoc}-backup`);

            // Simpan perubahan pada file .env
            writeFileSync(envLoc, env.replace(oldData, newData));

            return [true, `Data [${k}] berhasil diubah`];
        }

        // Apikey tidak ditemukan didalam file .env
        return [false, `Data [${k}] tidak ditemukan!`];
    }
}

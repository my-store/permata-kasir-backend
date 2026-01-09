import { Injectable, UnauthorizedException } from "@nestjs/common";
import { KasirServiceV1 } from "./kasir/v1/kasir.service.v1";
import { AdminServiceV1 } from "./admin/v1/admin.service.v1";
import { UserServiceV1 } from "./user/v1/user.service.v1";
import { Admin, User, Kasir } from "models/client";

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
}

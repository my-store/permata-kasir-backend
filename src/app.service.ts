import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AdminServiceV1 } from "./admin/v1/admin.service.v1";
import { UserServiceV1 } from "./user/v1/user.service.v1";
import { Admin, User } from "models/client";

@Injectable()
export class AppService {
    constructor(
        private readonly admin: AdminServiceV1,
        private readonly user: UserServiceV1,
    ) {}

    async updateOnlineStatus(
        tlp: string,
        role: string,
        newData: any,
    ): Promise<Admin | User> {
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

        // An error occured while updating data
        if (!updatedData) {
            // Terminate task
            throw new UnauthorizedException();
        }

        // Updated data
        return updatedData;
    }

    async login(tlp: string, role: string): Promise<Admin | User> {
        return this.updateOnlineStatus(tlp, role, { online: true });
    }

    async logout(tlp: string, role: string): Promise<Admin | User> {
        return this.updateOnlineStatus(tlp, role, {
            online: false,
            lastOnline: new Date().toISOString(),
        });
    }
}

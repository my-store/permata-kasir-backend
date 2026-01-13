/* =====================================================
|  USER PRA-REGISTRASI - KHUSUS ADMIN
|  =====================================================
|  Sebelum user berhasil registrasi, admin harus
|  membuatkan terlebihdahulu tiket pendaftaran
|  yang nantinya akan digunakan user.
|  -----------------------------------------------------
|  Created on: 12 January 2026
|  Updated on: 13 January 2026
*/
import { UserRegisterTicketServiceV1 } from "./user.register.ticket.service.v1";
import { CreateUserRegisterTicketDtoV1 } from "./dto/create.user.v1.dto";
import { UserRegisterTicket } from "models";
import {
    InternalServerErrorException,
    UnauthorizedException,
    Controller,
    Request,
    Body,
    Post,
} from "@nestjs/common";

@Controller({ version: "1", path: "user-register-ticket" })
export class UserRegisterTicketControllerV1 {
    constructor(private readonly service: UserRegisterTicketServiceV1) {}

    /* =====================================================
    |  USER PRA-REGISTRASI - KHUSUS ADMIN
    |  =====================================================
    |  Sebelum user berhasil registrasi, admin harus
    |  membuatkan terlebihdahulu tiket pendaftaran
    |  yang nantinya akan digunakan user.
    */
    @Post()
    async createRegisterTicket(
        @Body() data: CreateUserRegisterTicketDtoV1,
        @Request() req,
    ): Promise<UserRegisterTicket> {
        // Not admin but visited this route
        if (!req.user.role || req.user.role != "Admin") {
            // Block request
            throw new UnauthorizedException();
        }
        let newRegisterCode: UserRegisterTicket;
        try {
            newRegisterCode = await this.service.create(data);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
        return newRegisterCode;
    }
}

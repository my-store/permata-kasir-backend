import { ProdukController } from "./produk.controller";
import { PrismaService } from "src/prisma.service";
import { UserModule } from "src/user/user.module";
import { ProdukService } from "./produk.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [UserModule],
    controllers: [ProdukController],
    providers: [ProdukService, PrismaService],
})
export class ProdukModule {}

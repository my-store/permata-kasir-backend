import { TransaksiPenjualanModule } from "./transaksi-penjualan/transaksi-penjualan.module";
import { TransaksiPembelianModule } from "./transaksi-pembelian/transaksi-pembelian.module";
import { MemberRankingModule } from "./member-ranking/member-ranking.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AppTasksService } from "./app.tasks.service";
import { ProdukModule } from "./produk/produk.module";
import { DiskonModule } from "./diskon/diskon.module";
import { MemberModule } from "./member/member.module";
import { AdminModule } from "./admin/admin.module";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TokoModule } from "./toko/toko.module";
import { ConfigModule } from "@nestjs/config";
import { AppGateway } from "./app.gateway";
import { AppService } from "./app.service";
import { Module } from "@nestjs/common";
import { join } from "path";

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "client"),
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        AdminModule,
        UserModule,
        AuthModule,
        ProdukModule,
        TransaksiPenjualanModule,
        MemberModule,
        TransaksiPembelianModule,
        DiskonModule,
        TokoModule,
        MemberRankingModule,
    ],

    controllers: [AppController],

    providers: [AppGateway, AppService, AppTasksService],
})
export class AppModule {}

import { TransaksiPenjualanModule } from "./transaksi-penjualan/transaksi.penjualan.module";
import { TransaksiPembelianModule } from "./transaksi-pembelian/transaksi.pembelian.module";
import { MonitorTokoModule } from "./monitor-toko/monitor-toko.module";
import { MemberRankModule } from "./member-rank/member.rank.module";
import { UserRankModule } from "./user-rank/user.rank.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ProdukModule } from "./produk/produk.module";
import { DiskonModule } from "./diskon/diskon.module";
import { MemberModule } from "./member/member.module";
import { KasirModule } from "./kasir/kasir.module";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TokoModule } from "./toko/toko.module";
import { JasaModule } from "./jasa/jasa.module";
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
        AdminModule,
        UserModule,
        AuthModule,
        ProdukModule,
        TransaksiPenjualanModule,
        MemberModule,
        TransaksiPembelianModule,
        DiskonModule,
        TokoModule,
        MemberRankModule,
        JasaModule,
        UserRankModule,
        KasirModule,
        MonitorTokoModule,
    ],

    controllers: [AppController],

    providers: [AppGateway, AppService],
})
export class AppModule {}

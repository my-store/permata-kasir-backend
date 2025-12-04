import { ServeStaticModule } from "@nestjs/serve-static";
import { AdminModule } from "./admin/admin.module";
import { UserModule } from "./user/user.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
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
    ],

    controllers: [AppController],

    providers: [AppGateway, AppService],
})
export class AppModule {}

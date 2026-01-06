import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
        origin: "*", // Or specify your Expo app's origin, e.g., 'exp://192.168.1.X:19000'
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    });

    // Enable api versioning - 6 January 2026
    app.enableVersioning({
        type: VersioningType.URI,
    });

    app.setGlobalPrefix("api");

    // Enable public folder
    app.useStaticAssets("./public", { prefix: "/static/" });

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(process.env.APP_SERVER_PORT ?? 5000);
}

bootstrap();

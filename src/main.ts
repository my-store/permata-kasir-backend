import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*', // Or specify your Expo app's origin, e.g., 'exp://192.168.1.X:19000'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable public folder
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

  app.useGlobalPipes(new ValidationPipe());

  // Redirect the root URL to /api
  app.setGlobalPrefix('api');

  await app.listen(process.env.APP_SERVER_PORT ?? 5000);
}

bootstrap();

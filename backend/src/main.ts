import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';




async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //removes any option that is not written in the DTO
      forbidNonWhitelisted: false, // this throws forbidden error if the incoming request does not have the fields specified in the DTO
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // If you're using cookies
  });
  

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { LOG_LEVEL, WEBAPI_PORT } from 'libs/constants/src/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [LOG_LEVEL as LogLevel],
  });

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.use(cookieParser());

  await app.listen(WEBAPI_PORT);

  Logger.log(`Central web server running on http://localhost:${WEBAPI_PORT}`);
}
void bootstrap();

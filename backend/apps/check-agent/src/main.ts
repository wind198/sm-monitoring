import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel } from '@nestjs/common';
import { LOG_LEVEL } from 'libs/constants/src/envs';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule, {
    logger: [LOG_LEVEL as LogLevel],
  });
  Logger.log(`Check agent bootstraped successfully`);
}
void bootstrap();

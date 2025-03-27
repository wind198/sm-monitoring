import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LOG_LEVEL } from 'libs/constants/src/envs';
import { Logger, LogLevel } from '@nestjs/common';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule, {
    logger: [LOG_LEVEL as LogLevel],
  });
  Logger.log(`Scheduler bootstraped successfully`);
}
void bootstrap();

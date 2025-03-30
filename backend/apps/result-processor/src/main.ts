import { Logger, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'apps/result-processor/src/app.module';
import { LOG_LEVEL } from 'libs/constants/src/envs';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule, {
    logger: [LOG_LEVEL as LogLevel],
  });
  Logger.log(`Result processor bootstraped successfully`);
}
void bootstrap();

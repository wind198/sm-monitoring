import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from 'apps/scheduler/src/redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URL } from 'libs/constants/src/envs';
import { RabbitmqService } from 'apps/scheduler/src/rabbitmq/rabbitmq.service';
import { forkJoin, mergeMap } from 'rxjs';
import { RedisService } from 'apps/scheduler/src/redis/redis.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    RabbitmqModule,
    RedisModule,
    MongooseModule.forRoot(MONGO_URL, {
      enableUtf8Validation: false,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private rabbitMqService: RabbitmqService,
    private redisService: RedisService,
    private appService: AppService,
  ) {}

  onModuleInit() {
    forkJoin([
      this.rabbitMqService.initializeRabbitMqAssets(),
      this.redisService.connectToRedis(),
    ]).subscribe((v) => {
      Logger.log(`RabbitMQ and Redis connected successfully`);
      void this.appService.scheduleJob();
    });
  }
}

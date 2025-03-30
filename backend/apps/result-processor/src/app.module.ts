import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitmqModule } from 'apps/result-processor/src/rabbitmq/rabbitmq.module';
import { RabbitmqService } from 'apps/result-processor/src/rabbitmq/rabbitmq.service';
import { MONGO_URL } from 'libs/constants/src/envs';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URL, {
      enableUtf8Validation: false,
    }),
    RabbitmqModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private rabbitMqService: RabbitmqService) {}

  onModuleInit() {
    this.rabbitMqService.initializeRabbitMqAssets().subscribe();
  }
}

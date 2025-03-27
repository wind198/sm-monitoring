import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RabbitmqService } from 'apps/check-agent/src/rabbitmq/rabbitmq.service';
import { formatProgressMessage } from 'libs/helpers/src/formaters';

@Module({
  imports: [RabbitmqModule],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private rabbitMqService: RabbitmqService) {}

  onModuleInit() {
    this.rabbitMqService.initializeRabbitMqAssets().subscribe();
  }
}

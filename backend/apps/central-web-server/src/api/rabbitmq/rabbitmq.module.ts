import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ChannelModel } from 'amqplib';
import { LighthouseModule } from 'apps/central-web-server/src/api/lighthouse/lighthouse.module';
import { LighthouseService } from 'apps/central-web-server/src/api/lighthouse/lighthouse.service';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { connectToRabbitmq } from 'libs/helpers/src/rabbitmq';
import { forkJoin, mergeMap, tap } from 'rxjs';

@Module({
  providers: [],
  exports: [],
  imports: [LighthouseModule],
})
export class RabbitmqModule implements OnModuleInit {
  channelModel: ChannelModel;

  constructor(private lighthouseService: LighthouseService) {}

  onModuleInit() {
    const action = 'Setup RabbitMQ';
    Logger.log(formatProgressMessage.begin`${action}`);
    connectToRabbitmq()
      .pipe(
        mergeMap((channelModel) =>
          forkJoin([
            this.lighthouseService.initializeRabbitMqAssets(channelModel),
          ]),
        ),
        tap({
          error: (err) => {
            Logger.error(formatProgressMessage.begin`${action}`, err);
          },
          complete: () => {
            Logger.log(formatProgressMessage.end`${action}`);
          },
        }),
      )
      .subscribe();
  }
}

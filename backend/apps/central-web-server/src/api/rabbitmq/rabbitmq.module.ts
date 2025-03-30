import { Module } from '@nestjs/common';
import { ChannelModel } from 'amqplib';
import { LighthouseModule } from 'apps/central-web-server/src/api/check/lighthouse.module';
import { LighthouseService } from 'apps/central-web-server/src/api/check/lighthouse.service';

@Module({
  providers: [],
  exports: [],
  imports: [LighthouseModule],
})
export class RabbitmqModule {
  channelModel: ChannelModel;

  constructor(private lighthouseService: LighthouseService) {}
}

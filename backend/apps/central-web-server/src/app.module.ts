import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitorModule } from 'apps/central-web-server/src/api/monitor/monitor.module';
import { LighthouseModule } from 'apps/central-web-server/src/api/check/lighthouse.module';
import { LocationModule } from 'apps/central-web-server/src/api/location/location.module';
import { MONGO_URL } from 'libs/constants/src/envs';
import { LocationService } from 'apps/central-web-server/src/api/location/location.service';
import { RabbitmqModule } from 'apps/central-web-server/src/api/rabbitmq/rabbitmq.module';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    RabbitmqModule,
    MonitorModule,
    LighthouseModule,
    LocationModule,
    MongooseModule.forRoot(MONGO_URL, {
      enableUtf8Validation: false,
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private locationService: LocationService) {}

  async mockData() {
    if (!(await this.locationService.locationModel.countDocuments())) {
      await this.locationService.mockLocations();
    }
  }

  async onModuleInit() {
    Logger.log(formatProgressMessage.begin`Mock data`);
    await this.mockData();
    Logger.log(formatProgressMessage.end`Mock data`);
  }
}

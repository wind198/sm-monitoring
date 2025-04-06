import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LighthouseModule } from 'apps/central-web-server/src/api/check/lighthouse.module';
import { LocationModule } from 'apps/central-web-server/src/api/location/location.module';
import { MONGO_URL } from 'libs/constants/src/envs';
import { RabbitmqModule } from 'apps/central-web-server/src/api/rabbitmq/rabbitmq.module';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { ProjectModule } from './api/project/project.module';
import { SiteModule } from './api/site/site.module';
import { UserModule } from './api/user/user.module';
@Module({
  imports: [
    AppModule,
    AuthModule,
    ProjectModule,
    SiteModule,
    RabbitmqModule,
    LighthouseModule,
    LocationModule,
    UserModule,
    MongooseModule.forRoot(MONGO_URL, {
      enableUtf8Validation: false,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private appService: AppService) {}

  async onModuleInit() {
    Logger.log(formatProgressMessage.begin`Mock data`);
    await this.appService.mockData();
    Logger.log(formatProgressMessage.end`Mock data`);
  }
}

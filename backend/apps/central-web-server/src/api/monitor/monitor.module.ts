import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';
import { Monitor, MonitorSchema } from './schemas/monitor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Monitor.name, schema: MonitorSchema }]),
  ],
  controllers: [MonitorController],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule implements OnModuleInit {
  constructor(private readonly monitorService: MonitorService) {}

  onModuleInit() {
    void this.monitorService.refreshRunHourMap(true);
  }
}

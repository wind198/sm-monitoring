import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LighthouseService } from './lighthouse.service';
import { LighthouseController } from './lighthouse.controller';
import { Lighthouse, LighthouseSchema } from './schemas/lighthouse.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lighthouse.name, schema: LighthouseSchema },
    ]),
  ],
  controllers: [LighthouseController],
  providers: [LighthouseService],
  exports: [LighthouseService],
})
export class LighthouseModule {}

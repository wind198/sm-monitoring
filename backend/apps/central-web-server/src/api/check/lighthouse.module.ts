import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LighthouseService } from './lighthouse.service';
import { LighthouseController } from './lighthouse.controller';
import { Check, CheckSchema } from './schemas/check.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Check.name, schema: CheckSchema }]),
  ],
  controllers: [LighthouseController],
  providers: [LighthouseService],
  exports: [LighthouseService],
})
export class LighthouseModule {}

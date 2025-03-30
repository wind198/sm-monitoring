import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Channel, Replies } from 'amqplib';
import { IS_DEV } from 'libs/constants/src/envs';
import { Model } from 'mongoose';
import { Check, CheckDocument } from './schemas/check.schema';

@Injectable()
export class LighthouseService {
  constructor(
    @InjectModel(Check.name)
    private lighthouseModel: Model<CheckDocument>,
  ) {}

  monitorJobResultQueueChannel: Channel;

  monitorJobResultQueue: Replies.AssertQueue;

  lighthouseResultBuffer: Check[] = [];

  @Cron(IS_DEV ? CronExpression.EVERY_MINUTE : CronExpression.EVERY_5_MINUTES)
  async flushBuffer() {
    if (!this.lighthouseResultBuffer.length) return;
    const res = await this.lighthouseModel.bulkWrite(
      this.lighthouseResultBuffer.map((item) => ({
        insertOne: {
          document: item,
        },
      })),
    );
    this.lighthouseResultBuffer = [];
    Logger.debug(`Flushed ${res.insertedCount} lighthouse result to DB`);
  }
}

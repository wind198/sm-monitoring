import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lighthouse, LighthouseDocument } from './schemas/lighthouse.schema';
import { connectToRabbitmq } from 'libs/helpers/src/rabbitmq';
import { defer, from, map, retry, tap } from 'rxjs';
import { Channel, ChannelModel, Replies } from 'amqplib';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { MONITOR_JOB_RESULT_QUEUE } from 'libs/constants/src/keys';
import {
  DELARE_MONITOR_JOB_RESULT_QUEUE_ARGS,
  IS_DEV,
} from 'libs/constants/src/envs';
import { get } from 'lodash';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LighthouseService {
  constructor(
    @InjectModel(Lighthouse.name)
    private lighthouseModel: Model<LighthouseDocument>,
  ) {}

  monitorJobResultQueueChannel: Channel;

  monitorJobResultQueue: Replies.AssertQueue;

  lighthouseResultBuffer: Lighthouse[] = [];

  initializeRabbitMqAssets(channelModel: ChannelModel) {
    const action = `initialize RabbitMQ assets for lighthouse result`;
    Logger.log(formatProgressMessage.begin`${action}`);
    return from(
      (async () => {
        this.monitorJobResultQueueChannel = await channelModel.createChannel();
        this.monitorJobResultQueue =
          await this.monitorJobResultQueueChannel.assertQueue(
            MONITOR_JOB_RESULT_QUEUE,
            DELARE_MONITOR_JOB_RESULT_QUEUE_ARGS,
          );
        await this.monitorJobResultQueueChannel.consume(
          this.monitorJobResultQueue.queue,
          (msg) => {
            if (msg?.content) {
              Logger.debug(
                `Received message from ${this.monitorJobResultQueue.queue} @ ${msg.properties.timestamp}`,
              );

              const testResult = msg.content;
              const monitor = get(msg, ['properties', 'headers', 'monitor']);
              const runAt = get(msg, ['properties', 'headers', 'runAt']);
              const queuedAt = msg.properties.timestamp;
              this.lighthouseResultBuffer.push({
                relations: { monitor },
                testResult,
                timing: { queuedAt, runAt },
              });
              this.monitorJobResultQueueChannel.ack(msg);
            }
          },
          { noAck: false },
        );
      })(),
    ).pipe(
      tap({
        error: (err) => {
          Logger.error(`${action}`, err);
          Logger.log(`Retrying after 5 seconds...`);
        },
      }),
      retry({ count: 3, delay: 5000 }),
      tap({
        complete: () => {
          Logger.log(formatProgressMessage.end`${action}`);
        },
      }),
    );
  }

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

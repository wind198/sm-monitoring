import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Channel, ChannelModel, Replies } from 'amqplib';
import {
  DELARE_MANUAL_MONITOR_JOB_RESULT_QUEUE_ARGS,
  DELARE_MONITOR_JOB_QUEUE_ARGS,
} from 'libs/constants/src/envs';
import {
  MANUAL_MONITOR_JOB_QUEUE,
  MONITOR_JOB_QUEUE,
} from 'libs/constants/src/keys';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { connectToRabbitmq } from 'libs/helpers/src/rabbitmq';
import { Collection, Connection, Types } from 'mongoose';
import { from, map, retry, tap } from 'rxjs';
import { promisify } from 'util';
import { gzip } from 'zlib';
const gzipAsync = promisify(gzip);
@Injectable()
export class RabbitmqService {
  monitorCollection: Collection<any>;

  constructor(@InjectConnection() private connection: Connection) {
    this.monitorCollection = this.connection.collection('monitors');
  }

  currentCheckedMonitorIndex = 0;

  channelModel: ChannelModel;

  monitorJobQueueChannel: Channel;

  manualMonitorJobQueueChannel: Channel;

  manualMonitorJobQueue: Replies.AssertQueue;

  initializeRabbitMqAssets() {
    const action = `initialize RabbitMQ assets`;

    return connectToRabbitmq().pipe(
      map((channelModel) => {
        Logger.log(formatProgressMessage.begin`${action}`);
        return from(
          (async () => {
            this.channelModel = channelModel;

            await Promise.all([
              this.initializeMonitorJobQueueAssets(channelModel),
              this.initializeManualMonitorJobQueueAssets(channelModel),
            ]);
          })(),
        );
      }),

      tap({
        error: (err) => {
          Logger.error(`${action}`, err);
          Logger.log(`Retrying after 5 seconds...`);
          void this.tearDownRabbitmqAssets();
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

  async initializeMonitorJobQueueAssets(channelModel: ChannelModel) {
    this.monitorJobQueueChannel = await channelModel.createChannel();
  }

  async initializeManualMonitorJobQueueAssets(channelModel: ChannelModel) {
    this.manualMonitorJobQueueChannel = await channelModel.createChannel();
    this.manualMonitorJobQueue =
      await this.manualMonitorJobQueueChannel.assertQueue(
        MANUAL_MONITOR_JOB_QUEUE,
        DELARE_MANUAL_MONITOR_JOB_RESULT_QUEUE_ARGS,
      );
    await this.manualMonitorJobQueueChannel.consume(
      this.manualMonitorJobQueue.queue,
      (msg) => {
        Logger.debug(
          `Received message with ID ${msg?.properties.messageId} from queue ${this.manualMonitorJobQueue.queue} @ ${msg?.properties.timestamp}`,
        );
        if (msg) {
          void this.onManualMonitorJob(msg);
        }
      },
      { noAck: false },
    );
  }

  async onManualMonitorJob(msg: any) {
    const { monitorId, location } = JSON.parse(msg.content.toString());
    const matchMoitor = await this.monitorCollection.findOne({
      _id: new Types.ObjectId(monitorId),
    });
    if (!matchMoitor) {
      Logger.error(`Cannot find monitor with id ${monitorId}`);
      return;
    }
    const dto = {
      monitor: matchMoitor,
      location,
    };

    await this.sendJobToQueue(dto);
    this.manualMonitorJobQueueChannel.ack(msg);
  }

  async tearDownRabbitmqAssets() {
    await Promise.all([
      (() => {
        if (this.monitorJobQueueChannel) {
          return void this.monitorJobQueueChannel.close();
        }
      })(),
    ]);
    if (this.channelModel) void this.channelModel.close();
  }

  async getQueueForLocation(location: string) {
    return await this.monitorJobQueueChannel.assertQueue(
      `${MONITOR_JOB_QUEUE}:${location}`,
      DELARE_MONITOR_JOB_QUEUE_ARGS,
    );
  }

  async sendJobToQueue(payload: any, isManual = false) {
    const { monitor, location } = payload;

    const buffer = await gzipAsync(JSON.stringify({ monitor }));
    const q = await this.getQueueForLocation(location);
    const ok = this.monitorJobQueueChannel.sendToQueue(q.queue, buffer, {
      priority: isManual ? 10 : 0,
      timestamp: new Date().getTime(),
    });
    if (!ok) {
      Logger.error('Failed to send message to queue');
    } else {
      Logger.debug('Message sent to queue' + q.queue);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Channel, ChannelModel, ConsumeMessage, Replies } from 'amqplib';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { from, map, retry, tap } from 'rxjs';

import { DesktopConfig } from 'apps/check-agent/lighthouse-config/index';
import {
  DELARE_MONITOR_JOB_QUEUE_ARGS,
  DELARE_MONITOR_JOB_RESULT_QUEUE_ARGS,
  LOCATION,
} from 'libs/constants/src/envs';
import {
  MONITOR_JOB_QUEUE,
  MONITOR_JOB_RESULT_QUEUE,
} from 'libs/constants/src/keys';
import {
  formatDateTimestamp,
  formatProgressMessage,
} from 'libs/helpers/src/formaters';
import { connectToRabbitmq } from 'libs/helpers/src/rabbitmq';
import { get } from 'lodash';
import { promisify } from 'util';
import { brotliCompress, gunzip } from 'zlib';
const brotliCompressAsync = promisify(brotliCompress);
const gunzipAsync = promisify(gunzip);
@Injectable()
export class RabbitmqService {
  constructor() {}

  channelModel: ChannelModel;

  monitorJobQueueChannel: Channel;

  monitorJobQueue: Replies.AssertQueue;

  monitorJobResultQueueChannel: Channel;

  monitorJobResultQueue: Replies.AssertQueue;

  initializeRabbitMqAssets() {
    const action = `initialize RabbitMQ assets`;

    return connectToRabbitmq().pipe(
      map((channelModel) => {
        Logger.log(formatProgressMessage.begin`${action}`);
        this.channelModel = channelModel;
        return from(
          (async () => {
            await Promise.all([
              this.initializeMonitorJobQueueAssets(channelModel),
              this.initializeMonitorResultJobQueueAssets(channelModel),
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
        next: () => {
          Logger.log(formatProgressMessage.end`${action}`);
        },
      }),
    );
  }

  async initializeMonitorJobQueueAssets(channelModel: ChannelModel) {
    this.monitorJobQueueChannel = await channelModel.createChannel();
    this.monitorJobQueue = await this.monitorJobQueueChannel.assertQueue(
      `${MONITOR_JOB_QUEUE}:${LOCATION}`,
      DELARE_MONITOR_JOB_QUEUE_ARGS,
    );

    await this.monitorJobQueueChannel.consume(
      this.monitorJobQueue.queue,
      (msg) => {
        Logger.debug(
          `Received message from queue ${this.monitorJobQueue.queue} @ ${formatDateTimestamp(msg?.properties.timestamp)}`,
        );
        void this.onMonitorJob(msg);
      },
      { noAck: false },
    );
  }

  async initializeMonitorResultJobQueueAssets(channelModel: ChannelModel) {
    this.monitorJobResultQueueChannel = await channelModel.createChannel();
    this.monitorJobResultQueue =
      await this.monitorJobResultQueueChannel.assertQueue(
        MONITOR_JOB_RESULT_QUEUE,
        DELARE_MONITOR_JOB_RESULT_QUEUE_ARGS,
      );
  }

  async onMonitorJob(msg: ConsumeMessage | null) {
    try {
      if (msg !== null) {
        let jsonString;
        try {
          jsonString = (await gunzipAsync(msg.content)).toString();
        } catch (error) {
          Logger.error(
            formatProgressMessage.error`Error decoding msg content`,
            error,
          );
          jsonString = msg.content.toString();
        }
        const content = JSON.parse(jsonString);
        await this.processMonitorJob(content);
        this.monitorJobQueueChannel.ack(msg);
      }
    } catch (error) {
      Logger.error(
        formatProgressMessage.error`Error processing monitor job`,
        error,
      );
    }
  }

  async processMonitorJob(jobContent: any) {
    const { monitor } = jobContent;
    const checkRunCount = get(monitor, ['settings', 'checkRunCount'], 1);

    const runAt = new Date().getTime();
    const testResult = [] as any[];
    for (let index = 0; index < checkRunCount; index++) {
      try {
        const lighthouseRes = await this.runLighthouseCheck(monitor);
        if (!lighthouseRes) {
          throw new Error('Lighthouse return no result');
        }
        testResult.push({ status: 'fulfilled', value: lighthouseRes?.lhr });
      } catch (error) {
        testResult.push({ status: 'rejected', reason: error });
      }
    }
    const result = testResult.map((r, index) => {
      if (r.status === 'rejected') {
        Logger.error(r.reason);
      }
      return {
        ok: r.status === 'fulfilled',
        runIndex: index,
        result: r.status === 'fulfilled' ? r.value : null,
      };
    });
    await this.sendMonitorResultToQueue(monitor._id, result, runAt);
  }

  async runLighthouseCheck(monitor: any) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    const runnerResult = await lighthouse(
      monitor.url,
      {
        port: chrome.port,
        logLevel: 'info',
        output: 'json',
      },
      DesktopConfig,
    );

    chrome.kill();

    return runnerResult;
  }

  async tearDownRabbitmqAssets() {
    await Promise.all([
      (() => {
        if (this.monitorJobQueueChannel) {
          return void this.monitorJobQueueChannel.close();
        }
      })(),
      (() => {
        if (this.monitorJobResultQueueChannel) {
          return void this.monitorJobResultQueueChannel.close();
        }
      })(),
    ]);
    if (this.channelModel) void this.channelModel.close();
  }

  async sendMonitorResultToQueue(monitor: string, result: any, runAt: number) {
    const content = JSON.stringify(result);
    const buffer = await brotliCompressAsync(content);
    const ok = this.monitorJobResultQueueChannel.sendToQueue(
      this.monitorJobResultQueue.queue,
      buffer,
      { headers: { monitor, runAt }, timestamp: new Date().getTime() },
    );
    if (!ok) {
      Logger.error('Failed to send message to queue');
    } else {
      Logger.debug('Message sent to queue ' + this.monitorJobResultQueue.queue);
    }
  }
}

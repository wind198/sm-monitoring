import { Injectable, Logger } from '@nestjs/common';
import { Channel, ChannelModel, Replies } from 'amqplib';
import { from, map, retry, tap } from 'rxjs';

import {
  DELARE_MONITOR_JOB_RESULT_QUEUE_ARGS,
  IS_DEV,
} from 'libs/constants/src/envs';
import { MONITOR_JOB_RESULT_QUEUE } from 'libs/constants/src/keys';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { connectToRabbitmq } from 'libs/helpers/src/rabbitmq';
import { chunk, get, last, min } from 'lodash';
import { promisify } from 'util';
import { brotliDecompress } from 'zlib';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/mongoose';
import { Collection, Connection, Types } from 'mongoose';
import { LIGHTHOUSE_CATEGORIES } from 'libs/constants/src/others';
import {
  ICheckRunResult,
  ILighthouseScores,
  IScreenshotThumbnail,
} from 'libs/types/src/check';
import moment from 'moment';
const brotliDecompressAsync = promisify(brotliDecompress);

type IBufferItem = {
  relations: { monitor: string };
  testResult: Buffer;
  timing: {
    queuedAt: number;
    runAt: number;
  };
};

const getNominalCheckRun = (checkRuns: ICheckRunResult[]) => {
  let nominalIndex = min([1, checkRuns.length - 1])!;
  let output: ICheckRunResult | null = null;
  let attemptCount = 0;

  while (!output && attemptCount < checkRuns.length) {
    const current = checkRuns[nominalIndex];
    if (current.result) {
      output = current;
    }
    nominalIndex++;
    attemptCount++;
    if (nominalIndex >= checkRuns.length) {
      nominalIndex = 0;
    }
  }

  return output;
};

const getScreenshotThumbnailsFromLighthouseResult = (
  result: JSON | null,
): IScreenshotThumbnail[] => {
  if (!result) return [];
  return get(
    result,
    ['audits', 'screenshot-thumbnails', 'details', 'items'],
    [],
  );
};

const getCategoryScoresFromLighthouseResult = (
  result: object | null,
): ILighthouseScores => {
  if (!result) {
    return {
      'best-practices': null,
      accessibility: null,
      performance: null,
      seo: null,
    };
  }
  const output: [string, number | null][] = [];
  for (const key of LIGHTHOUSE_CATEGORIES) {
    const score = get(result, ['categories', key, 'score']);
    if (typeof score !== 'number') {
      output.push([key, null]);
    } else {
      output.push([key, score * 100]);
    }
  }

  return Object.fromEntries(output) as any;
};

@Injectable()
export class RabbitmqService {
  checkCollection: Collection;
  monitorCollection: Collection;
  constructor(@InjectConnection() private connection: Connection) {
    this.checkCollection = this.connection.collection('checks');
    this.monitorCollection = this.connection.collection('monitors');
  }

  channelModel: ChannelModel;

  monitorJobResultQueueChannel: Channel;

  monitorJobResultQueue: Replies.AssertQueue;

  resultBuffer: IBufferItem[] = [];

  initializeRabbitMqAssets() {
    const action = `initialize RabbitMQ assets`;

    return connectToRabbitmq().pipe(
      map((channelModel) => {
        Logger.log(formatProgressMessage.begin`${action}`);
        this.channelModel = channelModel;
        return from(
          (async () => {
            await Promise.all([
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

  async initializeMonitorResultJobQueueAssets(channelModel: ChannelModel) {
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
          this.resultBuffer.push({
            relations: { monitor },
            testResult,
            timing: { queuedAt, runAt },
          });
          // this.monitorJobResultQueueChannel.ack(msg);
        }
      },
      { noAck: false },
    );
  }

  async tearDownRabbitmqAssets() {
    await Promise.all([
      (() => {
        if (this.monitorJobResultQueueChannel) {
          return void this.monitorJobResultQueueChannel.close();
        }
      })(),
    ]);
    if (this.channelModel) void this.channelModel.close();
  }

  @Cron(IS_DEV ? CronExpression.EVERY_MINUTE : CronExpression.EVERY_5_MINUTES)
  async flushBuffer() {
    if (!this.resultBuffer.length) return;

    for (const $chunk of chunk(this.resultBuffer, 5)) {
      await Promise.all($chunk.map((i) => this.handleBufferItem(i)));
    }

    this.resultBuffer = [];
  }

  async handleBufferItem(i: IBufferItem) {
    const { relations, testResult, timing } = i;

    const testResultDecompressedBuffer =
      await brotliDecompressAsync(testResult);
    const testResultArr: ICheckRunResult[] = JSON.parse(
      testResultDecompressedBuffer.toString(),
    );

    const nominalCheckRun = getNominalCheckRun(testResultArr);

    if (!nominalCheckRun) {
      Logger.error(
        'Cannot find median check run for check of monitor ',
        relations.monitor,
      );
      return;
    }

    const scores = getCategoryScoresFromLighthouseResult(
      nominalCheckRun.result,
    );

    const screenshotThumbnails = getScreenshotThumbnailsFromLighthouseResult(
      nominalCheckRun.result,
    );

    const nominalCheckRunTimestamp = get(nominalCheckRun, [
      'result.fetchTime',
      new Date(timing.runAt).toISOString(),
    ]);

    const nominalCheckRunDate = moment(nominalCheckRunTimestamp)
      .startOf('day')
      .toISOString();

    const insertedCheck = await this.checkCollection.insertOne({
      relations,
      testResult,
      timing,
      scores,
    });
    const lastThumbData = last(screenshotThumbnails)?.data;

    await this.monitorCollection
      .aggregate([
        { $match: { _id: new Types.ObjectId(relations.monitor) } },
        {
          $set: {
            'latestData.thumbnail': lastThumbData,
            'latestData.scoreHistory': {
              $filter: {
                input: '$latestData.scoreHistory',
                as: 'scoreObject',
                cond: {
                  $ne: ['$$scoreObject.date', nominalCheckRunDate],
                },
              },
            },
          },
        },
        {
          $set: {
            'latestData.scoreHistory': {
              $concatArrays: [
                '$latestData.scoreHistory',
                [
                  {
                    timestamp: nominalCheckRunTimestamp,
                    date: nominalCheckRunDate,
                    scores,
                    checkId: insertedCheck.insertedId.toString(),
                  },
                ],
              ],
            },
          },
        },
        {
          $project: {
            latestData: 1,
          },
        },
        {
          $merge: {
            into: 'monitors',
            on: '_id',
            whenMatched: 'merge',
            whenNotMatched: 'discard',
          },
        },
      ])
      .toArray();
  }
}

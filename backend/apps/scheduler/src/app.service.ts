import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RabbitmqService } from 'apps/scheduler/src/rabbitmq/rabbitmq.service';
import { RedisService } from 'apps/scheduler/src/redis/redis.service';
import { CHECK_TIME_WINDOW, IS_DEV } from 'libs/constants/src/envs';
import { sleep } from 'libs/helpers/src/others';
import { get } from 'lodash';
import moment from 'moment';
import { Collection, Connection } from 'mongoose';

const MINUTE_PER_HOUR = 60;
const TIME_WINDOW_PER_HOUR = MINUTE_PER_HOUR / CHECK_TIME_WINDOW;

@Injectable()
export class AppService {
  monitorCollection: Collection<any>;
  constructor(
    @InjectConnection() private connection: Connection,
    private redisService: RedisService,
    private rabbitmqService: RabbitmqService,
  ) {
    this.monitorCollection = this.connection.collection('monitors');
  }

  determineCurrentHourAndCurrentTimeWindow() {
    const startOfWeek = moment().startOf('week');
    const currentHour = moment().diff(startOfWeek, 'hours');
    const currentTimeWindow = Math.floor(moment().minute() / CHECK_TIME_WINDOW);
    return {
      currentHour,
      currentTimeWindow,
    };
  }

  async getMonitorSkipAndLimit() {
    const [monitorCheckedCount, monitorToCheckPerTimeWindow] =
      await Promise.all([
        this.redisService.getMonitorCheckedCount(),
        this.redisService.getMonitorToCheckPerTimeWindow(),
      ]);

    return {
      skip: monitorCheckedCount,
      limit: monitorToCheckPerTimeWindow,
    };
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduleJob() {
    const { currentHour, currentTimeWindow } =
      this.determineCurrentHourAndCurrentTimeWindow();
    let { limit, skip } = await this.getMonitorSkipAndLimit();

    if (currentTimeWindow === 0 || skip === null || limit === null) {
      limit = 0;
      await Promise.all([
        this.redisService.setMonitorCheckedCount(0),
        (async () => {
          const monitorThatRunAtThisHour =
            await this.monitorCollection.countDocuments({
              deletedAt: null,
              isActive: true,
              ...(!IS_DEV && {
                'settings.runHours': currentHour,
              }),
            });

          skip = monitorThatRunAtThisHour / TIME_WINDOW_PER_HOUR;
          await this.redisService.setMonitorToCheckPerTimeWindow(
            Math.round(skip),
          );
        })(),
      ]);
    }

    const isLastTimeWindow = currentTimeWindow === TIME_WINDOW_PER_HOUR - 1;

    let monitorToRunInThisTimeWindowQuery = this.monitorCollection
      .find({
        deletedAt: null,
        'settings.isActive': true,
        ...(!IS_DEV && {
          'settings.runHours': currentHour,
        }),
      })
      .skip(skip!);
    if (!isLastTimeWindow) {
      monitorToRunInThisTimeWindowQuery =
        monitorToRunInThisTimeWindowQuery.limit(limit);
    }

    const monitorToRunInThisTimeWindow =
      await monitorToRunInThisTimeWindowQuery.toArray();

    console.log(JSON.stringify(monitorToRunInThisTimeWindow));

    for (const monitor of monitorToRunInThisTimeWindow) {
      await sleep(100);
      const locationListToRun: string[] = get(
        monitor,
        'settings.locationList',
        [],
      ).map((i) => i.toString());
      if (!locationListToRun.length) {
        Logger.error(`Monitor ${monitor.name} has no location to run`);
        continue;
      }
      const lastCheckedAtLocation = get(
        monitor,
        'metadata.lastCheckedAtLocation',
        '',
      ).toString();

      let targetLocation: string;
      if (!lastCheckedAtLocation) {
        targetLocation = locationListToRun[0];
      } else {
        const lastCheckedAtLocationIndex = locationListToRun.indexOf(
          lastCheckedAtLocation,
        );
        if (
          lastCheckedAtLocationIndex === -1 ||
          lastCheckedAtLocationIndex === locationListToRun.length - 1
        ) {
          targetLocation = locationListToRun[0];
        } else {
          targetLocation = locationListToRun[lastCheckedAtLocationIndex + 1];
        }
      }

      await this.sendJobToQueueForMonitor(monitor, targetLocation);
    }
  }

  async sendJobToQueueForMonitor(monitor: any, location: string) {
    const dto = {
      monitor,
      location,
    };
    return await this.rabbitmqService.sendJobToQueue(dto);
  }
}

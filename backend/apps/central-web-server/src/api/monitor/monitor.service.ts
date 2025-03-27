import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sleepRandom } from 'libs/helpers/src/others';
import { first, isEmpty, minBy, range, sumBy } from 'lodash';
import { Model } from 'mongoose';
import { Monitor, MonitorDocument } from './schemas/monitor.schema';
import { CreateMonitorDto } from 'apps/central-web-server/src/api/monitor/dtos/create-monitor.dto';

const HOUR_PER_DAY = 24;
const DAY_PER_WEEK = 7;
const HOUR_PER_WEEK = HOUR_PER_DAY * DAY_PER_WEEK;

@Injectable()
export class MonitorService {
  constructor(
    @InjectModel(Monitor.name) public monitorModel: Model<MonitorDocument>,
  ) {}

  runHourMap: Record<string, number>;

  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshRunHourMap(force = false) {
    if (!force) {
      await sleepRandom();
    }
    const res: { runHour: number; count: number }[] =
      await this.monitorModel.aggregate([
        {
          $match: {
            deletedAt: null,
            isActive: true,
          },
        },
        {
          $project: {
            'settings.runHour': 1,
          },
        },
        {
          $unwind: '$settings.runHour',
        },
        {
          $group: {
            _id: '$settings.runHour',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            runHour: '$_id.runHour',
            count: 1,
          },
        },
      ]);

    this.runHourMap = Object.fromEntries(
      res.map(({ count, runHour }) => [runHour.toString(), count]),
    );
  }

  getRunHourForEveryDayCheckFrequency() {
    const posibilies = range(HOUR_PER_DAY).map((i) =>
      range(DAY_PER_WEEK).map((_, index) => i + index * HOUR_PER_DAY),
    );

    if (isEmpty(this.runHourMap)) {
      return first(posibilies);
    }

    return minBy(posibilies, (i) => {
      return sumBy(i, (x) => this.refreshRunHourMap[x.toString()] ?? 0);
    });
  }

  getRunHourForEveryWeekCheckFrequency() {
    const posibilies = range(HOUR_PER_WEEK);

    if (isEmpty(this.runHourMap)) {
      return first(posibilies);
    }

    return minBy(posibilies, (i) => {
      return this.runHourMap[i.toString()] ?? 0;
    });
  }

  createMonitor(dto: CreateMonitorDto) {
    const { settings, ...others } = dto;
    const frequency = settings.frequency;
    switch (frequency) {
      case 'every_day':
        settings.runHours = this.getRunHourForEveryDayCheckFrequency()!;
        break;
      case 'every_week':
        settings.runHours = [this.getRunHourForEveryWeekCheckFrequency()!];
        break;
      default:
        throw new BadRequestException(`Invalid frequency: ${frequency}`);
        break;
    }
    return this.monitorModel.create({ ...others, settings });
  }
}

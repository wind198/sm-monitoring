import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from './schemas/site.schema';
import { CreateSiteDto } from 'apps/central-web-server/src/api/site/dtos/create-site.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sleepRandom } from 'libs/helpers/src/others';
import { first, isEmpty, minBy, range, sumBy } from 'lodash';

const DAY_PER_WEEK = 7;
const HOUR_PER_DAY = 24;
const HOUR_PER_WEEK = HOUR_PER_DAY * DAY_PER_WEEK;

@Injectable()
export class SiteService {
  constructor(@InjectModel(Site.name) public siteModel: Model<SiteDocument>) {}
  runHourMap: Record<string, number>;

  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshRunHourMap(force = false) {
    if (!force) {
      await sleepRandom();
    }
    const res: { runHour: number; count: number }[] =
      await this.siteModel.aggregate([
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

  createSite(data: CreateSiteDto) {
    const { settings, ...o } = data;

    switch (settings.frequency) {
      case 'every_day':
        settings.runHours = this.getRunHourForEveryDayCheckFrequency()!;
        break;
      case 'every_week':
        settings.runHours = [this.getRunHourForEveryWeekCheckFrequency()!];
        break;
      default:
        throw new BadRequestException(
          `Invalid frequency: ${settings.frequency}`,
        );
        break;
    }

    return this.siteModel.create(data);
  }
}

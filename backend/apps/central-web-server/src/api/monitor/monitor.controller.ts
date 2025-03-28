import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { UpdateMonitorDto } from './dtos/update-monitor.dto';
import { CreateMonitorDto } from './dtos/create-monitor.dto';
import { difference } from 'lodash';
import { formatSortForMongoose } from 'apps/central-web-server/src/common/helpers/formatters';
import { QsQuery } from 'apps/central-web-server/src/common/decorators/qs-query.decorator';
import { QsQueryObject } from 'apps/central-web-server/src/common/class-validators/qs-query.dto';

@Controller('monitors')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  getAugmentedPopulate(populate: string[]) {
    if (!populate?.length) return populate;
    return populate.filter((i) => i !== 'settings.locations');
  }

  @Post()
  async createOne(@Body() data: CreateMonitorDto) {
    return await this.monitorService.createMonitor(data);
  }

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {
    const { filters, pagination, populate, sort } = query;

    let command = this.monitorService.monitorModel
      .find(filters)
      .skip((pagination.page - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .populate(this.getAugmentedPopulate(populate))
      .sort(formatSortForMongoose(sort));
    if (populate?.includes('settings.locations')) {
      command = command.populate({
        path: 'settings.locations',
        model: 'Location',
        localField: 'settings.locations',
        foreignField: 'code',
      });
    }
    const [res, count] = await Promise.all([
      command.exec(),
      this.monitorService.monitorModel.countDocuments(filters),
    ]);
    return {
      data: res,
      meta: {
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: count,
        },
      },
    };
  }

  @Get('get-many')
  async getMany(@QsQuery() query: QsQueryObject) {
    const { populate, ids } = query;
    let command = this.monitorService.monitorModel
      .find({ _id: { $in: ids } })
      .populate(this.getAugmentedPopulate(populate));
    if (populate?.includes('settings.locations')) {
      command = command.populate({
        path: 'settings.locations',
        model: 'Location',
        localField: 'settings.locations',
        foreignField: 'code',
      });
    }

    const res = await command.exec();

    return { data: res };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {
    const { populate } = query;
    let command = this.monitorService.monitorModel
      .findById(id)
      .populate(this.getAugmentedPopulate(populate));
    if (populate?.includes('settings.locations')) {
      command = command.populate({
        path: 'settings.locations',
        model: 'Location',
        localField: 'settings.locations',
        foreignField: 'code',
      });
    }

    const res = await command.exec();

    return { data: res };
  }

  @Put('update-many')
  async updateMany(
    @QsQuery() query: QsQueryObject,
    @Body() body: UpdateMonitorDto,
  ) {
    const { ids } = query;
    await this.monitorService.monitorModel.updateMany(
      { _id: { $in: ids } },
      body,
    );
    return { data: ids };
  }

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateMonitorDto,
    @QsQuery() query: QsQueryObject,
  ) {
    const { populate } = query;
    const res = await this.monitorService.monitorModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate(populate);

    return { data: res };
  }

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {
    const { ids } = query;

    const res = await this.monitorService.monitorModel.deleteMany({
      _id: { $in: ids },
    });
    if (res.deletedCount < ids.length) {
      const remained = await this.monitorService.monitorModel.find(
        {
          _id: { $in: ids },
        },
        { _id: true },
      );
      const reallyDeletedIds = difference(
        ids,
        remained.map((item) => item.id),
      );
      return { data: reallyDeletedIds };
    }
    return { data: ids };
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    const res = await this.monitorService.monitorModel.findByIdAndDelete(id);
    return { data: res };
  }
}

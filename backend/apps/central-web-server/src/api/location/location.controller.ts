import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { UpdateLocationDto } from './dtos/update-location.dto';
import { CreateLocationDto } from './dtos/create-location.dto';
import { difference } from 'lodash';
import { QsQueryObject } from 'apps/central-web-server/src/common/class-validators/qs-query.dto';
import { QsQuery } from 'apps/central-web-server/src/common/decorators/qs-query.decorator';
import { formatSortForMongoose } from 'apps/central-web-server/src/common/helpers/formatters';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async createOne(@Body() data: CreateLocationDto) {
    return await this.locationService.locationModel.create(data);
  }

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {
    const { filters, pagination, populate, sort } = query;

    const [res, count] = await Promise.all([
      this.locationService.locationModel
        .find(filters)
        .skip((pagination.page - 1) * pagination.pageSize)
        .limit(pagination.pageSize)
        .populate(populate)
        .sort(formatSortForMongoose(sort)),
      this.locationService.locationModel.countDocuments(filters),
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
    const res = await this.locationService.locationModel
      .find({ _id: { $in: ids } })
      .populate(populate);

    return { data: res };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {
    const { populate } = query;
    const res = await this.locationService.locationModel
      .findById(id)
      .populate(populate);

    return { data: res };
  }

  @Put('update-many')
  async updateMany(
    @QsQuery() query: QsQueryObject,
    @Body() body: UpdateLocationDto,
  ) {
    const { ids } = query;
    await this.locationService.locationModel.updateMany(
      { _id: { $in: ids } },
      body,
    );

    return { data: ids };
  }

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateLocationDto,
    @QsQuery() query: QsQueryObject,
  ) {
    const { populate } = query;
    const res = await this.locationService.locationModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate(populate);

    return { data: res };
  }

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {
    const { ids } = query;

    const res = await this.locationService.locationModel.deleteMany({
      _id: { $in: ids },
    });
    if (res.deletedCount < ids.length) {
      const remained = await this.locationService.locationModel.find(
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
    const res = await this.locationService.locationModel.findByIdAndDelete(id);
    return { data: res };
  }
}

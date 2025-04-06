import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SiteService } from './site.service';
import { UpdateSiteDto } from './dtos/update-site.dto';
import { CreateSiteDto } from './dtos/create-site.dto';
import { QsQuery } from 'apps/central-web-server/src/common/decorators/qs-query.decorator';
import { QsQueryObject } from 'apps/central-web-server/src/common/class-validators/qs-query.dto';
import { formatSortForMongoose } from 'apps/central-web-server/src/common/helpers/formatters';
import { difference } from 'lodash';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  async createOne(@Body() data: CreateSiteDto) {
    return await this.siteService.createSite(data);
  }

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {
    const { filters, pagination, populate, sort } = query;

    const [res, count] = await Promise.all([
      this.siteService.siteModel
        .find(filters)
        .skip((pagination.page - 1) * pagination.pageSize)
        .limit(pagination.pageSize)
        .populate(populate)
        .sort(formatSortForMongoose(sort)),
      this.siteService.siteModel.countDocuments(filters),
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
    const res = await this.siteService.siteModel
      .find({ _id: { $in: ids } })
      .populate(populate);

    return { data: res };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {
    const { populate } = query;
    const res = await this.siteService.siteModel
      .findById(id)
      .populate(populate);

    return { data: res };
  }

  @Put('update-many')
  async updateMany(
    @QsQuery() query: QsQueryObject,
    @Body() body: UpdateSiteDto,
  ) {
    const { ids } = query;
    await this.siteService.siteModel.updateMany({ _id: { $in: ids } }, body);

    return { data: ids };
  }

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateSiteDto,
    @QsQuery() query: QsQueryObject,
  ) {
    const { populate } = query;
    const res = await this.siteService.siteModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate(populate);

    return { data: res };
  }

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {
    const { ids } = query;

    const res = await this.siteService.siteModel.deleteMany({
      _id: { $in: ids },
    });
    if (res.deletedCount < ids.length) {
      const remained = await this.siteService.siteModel.find(
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
    const res = await this.siteService.siteModel.findByIdAndDelete(id);
    return { data: res };
  }
}

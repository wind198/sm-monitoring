import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { CreateProjectDto } from './dtos/create-project.dto';
import { QsQuery } from 'apps/central-web-server/src/common/decorators/qs-query.decorator';
import { QsQueryObject } from 'apps/central-web-server/src/common/class-validators/qs-query.dto';
import { formatSortForMongoose } from 'apps/central-web-server/src/common/helpers/formatters';
import { difference } from 'lodash';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createOne(@Body() data: CreateProjectDto) {
    return await this.projectService.createProject(data);
  }

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {
    const { filters, pagination, populate, sort } = query;

    const [res, count] = await Promise.all([
      this.projectService.projectModel
        .find(filters)
        .skip((pagination.page - 1) * pagination.pageSize)
        .limit(pagination.pageSize)
        .populate(populate)
        .sort(formatSortForMongoose(sort)),
      this.projectService.projectModel.countDocuments(filters),
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
    const res = await this.projectService.projectModel
      .find({ _id: { $in: ids } })
      .populate(populate);

    return { data: res };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {
    const { populate } = query;
    const res = await this.projectService.projectModel
      .findById(id)
      .populate(populate);

    return { data: res };
  }

  @Put('update-many')
  async updateMany(
    @QsQuery() query: QsQueryObject,
    @Body() body: UpdateProjectDto,
  ) {
    const { ids } = query;
    await this.projectService.projectModel.updateMany(
      { _id: { $in: ids } },
      body,
    );

    return { data: ids };
  }

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @QsQuery() query: QsQueryObject,
  ) {
    const { populate } = query;
    const res = await this.projectService.projectModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate(populate);

    return { data: res };
  }

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {
    const { ids } = query;

    const res = await this.projectService.projectModel.deleteMany({
      _id: { $in: ids },
    });
    if (res.deletedCount < ids.length) {
      const remained = await this.projectService.projectModel.find(
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
    const res = await this.projectService.projectModel.findByIdAndDelete(id);
    return { data: res };
  }
}

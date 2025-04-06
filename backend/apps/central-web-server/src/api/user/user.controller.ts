import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { difference } from 'lodash';
import { formatSortForMongoose } from 'apps/central-web-server/src/common/helpers/formatters';
import { QsQuery } from 'apps/central-web-server/src/common/decorators/qs-query.decorator';
import { QsQueryObject } from 'apps/central-web-server/src/common/class-validators/qs-query.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createOne(@Body() data: CreateUserDto) {
    return await this.userService.createUser(data);
  }

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {
    const { filters, pagination, populate, sort } = query;

    const command = this.userService.userModel
      .find(filters)
      .skip((pagination.page - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .populate(populate)
      .sort(formatSortForMongoose(sort));
    const [res, count] = await Promise.all([
      command.exec(),
      this.userService.userModel.countDocuments(filters),
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
    const command = this.userService.userModel
      .find({ _id: { $in: ids } })
      .populate(populate);

    const res = await command.exec();

    return { data: res };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {
    const { populate } = query;
    const command = this.userService.userModel.findById(id).populate(populate);

    const res = await command.exec();

    return { data: res };
  }

  @Put('update-many')
  async updateMany(
    @QsQuery() query: QsQueryObject,
    @Body() body: UpdateUserDto,
  ) {
    const { ids } = query;
    await this.userService.userModel.updateMany({ _id: { $in: ids } }, body);
    return { data: ids };
  }

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @QsQuery() query: QsQueryObject,
  ) {
    const { populate } = query;
    const res = await this.userService.userModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate(populate);

    return { data: res };
  }

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {
    const { ids } = query;

    const res = await this.userService.userModel.deleteMany({
      _id: { $in: ids },
    });
    if (res.deletedCount < ids.length) {
      const remained = await this.userService.userModel.find(
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
    const res = await this.userService.userModel.findByIdAndDelete(id);
    return { data: res };
  }
}

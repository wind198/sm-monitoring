import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LighthouseService } from './lighthouse.service';
import { UpdateLighthouseDto } from './dtos/update-lighthouse.dto';
import { CreateLighthouseDto } from './dtos/create-lighthouse.dto';
import { QsQuery } from 'apps/central-web-server/src/common/decorators/qs-query.decorator';
import { QsQueryObject } from 'apps/central-web-server/src/common/class-validators/qs-query.dto';

@Controller('lighthouses')
export class LighthouseController {
  constructor(private readonly lighthouseService: LighthouseService) {}

  @Post()
  async createOne(@Body() data: CreateLighthouseDto) {}

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {}

  @Get('get-many')
  async getMany(@QsQuery() query: QsQueryObject) {}

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {}

  @Put('update-many')
  async updateMany(
    @QsQuery() query: QsQueryObject,
    @Body() body: UpdateLighthouseDto,
  ) {}

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UpdateLighthouseDto,
    @QsQuery() query: QsQueryObject,
  ) {}

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {}

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {}
}

import { Controller, Delete, Get, Param } from '@nestjs/common';
import { QsQueryObject } from 'apps/central-web-server/src/common/class-validators/qs-query.dto';
import { QsQuery } from 'apps/central-web-server/src/common/decorators/qs-query.decorator';
import { LighthouseService } from './lighthouse.service';

@Controller('lighthouses')
export class LighthouseController {
  constructor(private readonly lighthouseService: LighthouseService) {}

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {}

  @Get('get-many')
  async getMany(@QsQuery() query: QsQueryObject) {}

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {}

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {}

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {}
}

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SiteService } from './site.service';
import { QsQuery } from 'src/common/decorators/qs-query.decorator';
import { QsQueryObject } from 'src/common/class-validators/qs-query.dto';
import { UpdateSiteDto } from './dtos/update-site.dto';
import { CreateSiteDto } from './dtos/create-site.dto';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  async createOne(@Body() data: CreateSiteDto) {}

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {}

  @Get('get-many')
  async getMany(@QsQuery() query: QsQueryObject) {}

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {}

  @Put('update-many')
  async updateMany(@QsQuery() query: QsQueryObject, @Body() body: UpdateSiteDto) {}

  @Put(':id')
  async updateOne(@Param('id') id: string, @Body() body: UpdateSiteDto, @QsQuery() query: QsQueryObject) {}

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {}

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {}

}
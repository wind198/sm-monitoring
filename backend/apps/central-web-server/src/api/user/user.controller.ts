import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { QsQuery } from 'src/common/decorators/qs-query.decorator';
import { QsQueryObject } from 'src/common/class-validators/qs-query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createOne(@Body() data: CreateUserDto) {}

  @Get()
  async getList(@QsQuery() query: QsQueryObject) {}

  @Get('get-many')
  async getMany(@QsQuery() query: QsQueryObject) {}

  @Get(':id')
  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {}

  @Put('update-many')
  async updateMany(@QsQuery() query: QsQueryObject, @Body() body: UpdateUserDto) {}

  @Put(':id')
  async updateOne(@Param('id') id: string, @Body() body: UpdateUserDto, @QsQuery() query: QsQueryObject) {}

  @Delete('delete-many')
  async deleteMany(@QsQuery() query: QsQueryObject) {}

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {}

}
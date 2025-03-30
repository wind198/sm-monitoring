import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from 'apps/central-web-server/src/api/project/dtos/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) public projectModel: Model<ProjectDocument>,
  ) {}

  async createProject(dto: CreateProjectDto) {
    return await this.projectModel.create(dto);
  }
}

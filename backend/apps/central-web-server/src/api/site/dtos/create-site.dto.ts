import { MonitorDocument } from 'apps/central-web-server/src/api/monitor/schemas/monitor.schema';
import { ProjectDocument } from 'apps/central-web-server/src/api/project/schemas/project.schema';
import {
  Relations,
  Setting,
  Site,
} from 'apps/central-web-server/src/api/site/schemas/site.schema';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateSiteDtoRelatons implements Relations {
  @IsMongoId({ each: true }) monitors: MonitorDocument[];
  @IsMongoId() project: ProjectDocument;
}

class CreateSiteDtoSettings implements Setting {
  @IsString({ each: true }) locations: string[];
  @IsOptional() @IsBoolean() isActive: boolean;
  runHours: number[];
  @IsDefined()
  frequency: string | number;

  @IsOptional() @IsObject() lighthouseConfig: any;
}

export class CreateSiteDto implements Site {
  @IsString() name: string;

  @ValidateNested()
  @Type(() => CreateSiteDtoSettings)
  settings: CreateSiteDtoSettings;

  @ValidateNested()
  @Type(() => CreateSiteDtoRelatons)
  relations: Relations;

  deletedAt: Date;
}

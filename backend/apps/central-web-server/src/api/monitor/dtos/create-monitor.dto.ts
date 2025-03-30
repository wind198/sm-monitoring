import {
  LatestData,
  Metadata,
  Monitor,
  Relations,
} from 'apps/central-web-server/src/api/monitor/schemas/monitor.schema';
import { ProjectDocument } from 'apps/central-web-server/src/api/project/schemas/project.schema';
import { SiteDocument } from 'apps/central-web-server/src/api/site/schemas/site.schema';
import { SHORT_STRING_MAX_LEN } from 'apps/central-web-server/src/common/constants/validations';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateMonitorDtoRelatons implements Relations {
  @IsMongoId() project: ProjectDocument;
  @IsMongoId() site: SiteDocument;
}
export class CreateMonitorDto implements Monitor {
  deletedAt: Date;
  latestData: LatestData;
  metadata: Metadata;

  @ValidateNested()
  @Type(() => CreateMonitorDtoRelatons)
  relations: CreateMonitorDtoRelatons;

  @IsUrl() @IsString() url: string;
  @IsString() @IsNotEmpty() @MaxLength(SHORT_STRING_MAX_LEN) name: string;
}

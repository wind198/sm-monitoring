import { LocationDocument } from 'apps/central-web-server/src/api/location/schemas/location.schema';
import {
  Monitor,
  Setting,
} from 'apps/central-web-server/src/api/monitor/schemas/monitor.schema';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class CreateMonitorDtoSetting implements Setting {
  @IsMongoId({ each: true }) locations: string[];
  @IsOptional() @IsBoolean() isActive: boolean;
  runHours: number[];
  @IsDefined()
  frequency: string | number;

  @IsOptional() @IsObject() lighthouseConfig: any;
}
export class CreateMonitorDto implements Monitor {
  metadata: Setting;

  @IsUrl() @IsString() url: string;
  @IsString() name: string;

  @ValidateNested()
  @Type(() => CreateMonitorDtoSetting)
  settings: Setting;
}

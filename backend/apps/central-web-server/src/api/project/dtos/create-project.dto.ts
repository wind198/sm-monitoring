import { Project } from 'apps/central-web-server/src/api/project/schemas/project.schema';
import { SiteDocument } from 'apps/central-web-server/src/api/site/schemas/site.schema';
import { UserDocument } from 'apps/central-web-server/src/api/user/schemas/user.schema';
import { SHORT_STRING_MAX_LEN } from 'apps/central-web-server/src/common/constants/validations';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto implements Project {
  @IsString() @IsNotEmpty() @MaxLength(SHORT_STRING_MAX_LEN) name: string;
  @IsString() @IsNotEmpty() @MaxLength(SHORT_STRING_MAX_LEN) code: string;
  sites: SiteDocument[];
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  admins: UserDocument;

  @IsMongoId({ each: true })
  members: UserDocument;
}

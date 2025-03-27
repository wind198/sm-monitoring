import { Location } from 'apps/central-web-server/src/api/location/schemas/location.schema';
import { IsString, MaxLength } from 'class-validator';
import { SHORT_STRING_MAX_LEN } from 'libs/constants/src/validations';

export class CreateLocationDto implements Location {
  @IsString() @MaxLength(SHORT_STRING_MAX_LEN) name: string;
  @IsString() @MaxLength(SHORT_STRING_MAX_LEN) code: string;
}

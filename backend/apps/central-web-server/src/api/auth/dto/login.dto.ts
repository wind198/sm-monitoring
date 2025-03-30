import { IsEmail, IsString, MaxLength } from 'class-validator';
import { SHORT_STRING_MAX_LEN } from 'apps/central-web-server/src/common/constants/validations';

export class LoginDto {
  @IsString() @IsEmail() email: string;
  @IsString() @MaxLength(SHORT_STRING_MAX_LEN) password: string;
}

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  IUserType,
  User,
  UserApiKey,
  userTypeList,
} from '../schemas/user.schema';
import { SHORT_STRING_MAX_LEN } from 'apps/central-web-server/src/common/constants/validations';

export class CreateUserDto implements User {
  password: string;
  deletedAt: Date;
  isActive: boolean;
  @IsString() @MaxLength(SHORT_STRING_MAX_LEN) @IsNotEmpty() firstName: string;
  @IsString() @MaxLength(SHORT_STRING_MAX_LEN) @IsNotEmpty() lastName: string;
  fullName: string;
  @IsEmail() @IsNotEmpty() email: string;
  @IsEnum(userTypeList) @IsNotEmpty() type: IUserType;
  apiKeys: UserApiKey[];
  activationKey: string;
}

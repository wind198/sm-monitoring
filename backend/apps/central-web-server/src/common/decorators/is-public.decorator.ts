import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from 'libs/constants/src/keys';

export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

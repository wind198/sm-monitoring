import { PartialType } from '@nestjs/mapped-types';
import { CreateLighthouseDto } from './create-lighthouse.dto';

export class UpdateLighthouseDto extends PartialType(CreateLighthouseDto) {}

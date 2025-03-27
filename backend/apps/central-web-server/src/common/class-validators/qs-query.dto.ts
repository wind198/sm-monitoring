import { IFilters } from 'apps/central-web-server/src/common/types/filters';
import { IPagination } from 'apps/central-web-server/src/common/types/pagination';
import { ISort } from 'apps/central-web-server/src/common/types/sort';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { DEFAULT_PAGE_SIZE } from 'libs/constants/src/others';
import { GET_MANY_MAX_LENGTH } from 'libs/constants/src/validations';

// Validate the parsed object by qs

class Sort implements ISort {
  @IsString()
  field: string;

  @IsString()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';
}

class Pagination implements IPagination {
  @IsInt()
  @Min(1)
  page: number;

  @IsInt()
  @Min(1)
  pageSize: number;
}

export class QsQueryObject {
  @IsOptional()
  @IsObject()
  filters: IFilters;

  @IsOptional()
  @ValidateNested()
  @Type(() => Sort)
  sort: Sort;

  @IsOptional()
  @ValidateNested()
  @Type(() => Pagination)
  pagination: Pagination = {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  populate: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(GET_MANY_MAX_LENGTH)
  @IsString({ each: true })
  ids: string[];
}

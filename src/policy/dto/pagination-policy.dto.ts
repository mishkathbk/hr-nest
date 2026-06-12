import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterItemDto {
  @IsString()
  field: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsInt()
  condition?: number; // 1 = contains, 2 = equals, etc. (reserved for future use)
}

export class PaginationPolicyDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageNumber?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string = '';

  @IsOptional()
  @IsString()
  sortBy?: string = 'policyid';

  @IsOptional()
  @IsBoolean()
  isDescending?: boolean = true;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterItemDto)
  filters?: FilterItemDto[] = [];
}

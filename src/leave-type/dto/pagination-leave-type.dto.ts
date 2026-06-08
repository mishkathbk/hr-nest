import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Represents a single date-filter entry from the filterList array.
 * Mirrors the .NET filterList pattern used in listPagination.
 */
export class FilterItemDto {
  @IsString()
  attributeName: string;

  @IsString()
  attributeValue: string;
}

/**
 * PaginationLeaveTypeDto
 * Body: { search?, filterList?, offset?, limit? }
 */
export class PaginationLeaveTypeDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterItemDto)
  filterList?: FilterItemDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}


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

/**
 * Represents a single filter entry from the filters array.
 * e.g. { field: "statuscd", value: "1", condition: 1 }
 */
export class FilterItemDto {
  @IsString()
  field: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsInt()
  condition?: number; // 1 = contains, 2 = equals, etc. (reserved for future use)
}

/**
 * PaginationSalaryTypeDto
 * Body: {
 *   pageNumber : 1,
 *   pageSize   : 10,
 *   search     : "",
 *   sortBy     : "",
 *   isDescending: true,
 *   filters    : []
 * }
 */
export class PaginationSalaryTypeDto {
  /** 1-based page number */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageNumber?: number = 1;

  /** Number of records per page */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;

  /** Full-text search across salarytypecode / salarytypename */
  @IsOptional()
  @IsString()
  search?: string = '';

  /** Column name to sort by (matches Prisma field names) */
  @IsOptional()
  @IsString()
  sortBy?: string = 'salarytypeid';

  /** true = DESC, false = ASC */
  @IsOptional()
  @IsBoolean()
  isDescending?: boolean = true;

  /** Additional key-value filters */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterItemDto)
  filters?: FilterItemDto[] = [];
}

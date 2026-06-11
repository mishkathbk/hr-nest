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
 * e.g. { attributeName: "statuscd", attributeValue: "1" }
 */
export class FilterItemDto {
  @IsString()
  attributeName: string;

  @IsString()
  attributeValue: string;
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

import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SalaryAdvanceReqFilterItemDto {
  @IsString()
  attributeName: string;

  @IsString()
  attributeValue: string;
}

/**
 * PaginationSalaryAdvanceReqDto
 * Body: { search?, filterList?, offset?, limit? }
 */
export class PaginationSalaryAdvanceReqDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryAdvanceReqFilterItemDto)
  filterList?: SalaryAdvanceReqFilterItemDto[];

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

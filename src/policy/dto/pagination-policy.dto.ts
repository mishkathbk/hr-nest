import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PolicyFilterItemDto {
  @IsString()
  attributeName: string;

  @IsString()
  attributeValue: string;
}

/**
 * PaginationPolicyDto
 * Body: { search?, filterList?, offset?, limit? }
 */
export class PaginationPolicyDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyFilterItemDto)
  filterList?: PolicyFilterItemDto[];

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

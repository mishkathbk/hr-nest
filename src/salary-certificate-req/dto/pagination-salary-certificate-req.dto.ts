import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SalaryCertificateReqFilterItemDto {
  @IsString()
  attributeName: string;

  @IsString()
  attributeValue: string;
}

/**
 * PaginationSalaryCertificateReqDto
 * Body: { search?, filterList?, offset?, limit? }
 */
export class PaginationSalaryCertificateReqDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryCertificateReqFilterItemDto)
  filterList?: SalaryCertificateReqFilterItemDto[];

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

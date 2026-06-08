import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalaryTypeDto {

  @IsOptional()
  @IsString()
  SalaryTypeCode?: string;

  @IsOptional()
  @IsString()
  SalaryTypeName?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  CompanyId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  StatusCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  SalaryTypeCategoryCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  SalaryTypeCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  SortOrder?: number;
}

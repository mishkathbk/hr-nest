import { IsString, IsOptional, IsInt, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateSalaryTypeDto {
  @IsOptional()
  @IsString()
  salaryTypeCode?: string;

  @IsOptional()
  @IsString()
  salaryTypeName?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statusCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  salaryTypeCategoryCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  salaryTypeCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

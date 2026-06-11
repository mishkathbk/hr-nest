import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSalaryAdjustmentDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  EmployeeId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  SalaryTypeId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  PayrollYear?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  PayrollMonth?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  Amount?: number;

  @IsOptional()
  @IsString()
  Remarks?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  CompanyId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  StatusCd?: number;
}

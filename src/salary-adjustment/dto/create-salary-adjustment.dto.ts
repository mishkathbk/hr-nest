import { IsString, IsOptional, IsInt, IsNumber, IsBoolean, IsDateString } from "class-validator";
import { Type } from "class-transformer";

export class CreateSalaryAdjustmentDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  employeeid?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  salaryTypeid?: number;

  @IsOptional()
  @IsDateString()
  payrolldate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyid?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statuscd?: number;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateSalaryAdvanceReqDto {
  @IsString()
  reqno: string;

  @IsInt()
  @Type(() => Number)
  employeeid: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  reqforcd?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  grosssalary?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salaryadvanceamountreq?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  approvedamount?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  noofdeductions?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amountdeductiblepermonth?: number;

  @IsOptional()
  @IsDateString()
  deductionstartdate?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  approvedby?: number;

  @IsOptional()
  @IsDateString()
  approveddate?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statuscd?: number;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

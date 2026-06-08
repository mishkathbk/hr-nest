import { IsString, IsOptional, IsInt, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalaryAdvanceReqDto {
  @IsString()
  reqNo: string;

  @IsOptional()
  @IsString()
  requestingFor?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  grossSalary?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salaryAdvanceAmountReq?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statusCd?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

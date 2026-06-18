import { IsInt, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculatePayrollDto {
  @IsInt()
  @Type(() => Number)
  year: number;

  @IsInt()
  @Type(() => Number)
  month: number; // 1-12

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  employeeIds?: number[]; // empty/null = all active employees
}

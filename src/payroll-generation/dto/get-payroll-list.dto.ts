import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPayrollListDto {
  @IsInt()
  @Type(() => Number)
  year: number;

  @IsInt()
  @Type(() => Number)
  month: number; // 1-12

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  employeeId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  departmentId?: number;
}

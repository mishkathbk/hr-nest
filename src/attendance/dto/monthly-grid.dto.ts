import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MonthlyGridDto {
  @IsInt()
  @Type(() => Number)
  month: number; // 1-12

  @IsInt()
  @Type(() => Number)
  year: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  departmentId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  employeeId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}

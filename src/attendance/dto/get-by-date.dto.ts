import { IsInt, IsDateString, IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetByDateDto {
  @IsInt()
  @Type(() => Number)
  employeeId: number;

  @IsDateString()
  date: string; // 'YYYY-MM-DD'
}

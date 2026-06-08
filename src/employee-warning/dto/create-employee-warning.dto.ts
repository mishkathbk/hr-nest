import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeWarningDto {
  @IsInt()
  @Type(() => Number)
  employeeId: number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  warningMessage?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statusCd?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

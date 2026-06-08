import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLeaveTypeDto {

  @IsOptional()
  @IsString()
  LeaveTypeCode?: string;

  @IsOptional()
  @IsString()
  LeaveTypeName?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  CompanyId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  StatusCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  LeaveTypeCategoryCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  LeaveTypeCd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  MaximumLeaveDays?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  DaysBeforeLeave?: number;

  @IsOptional()
  @IsBoolean()
  IsDocumentMandatory?: boolean;
}

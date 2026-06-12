import { IsString, IsOptional, IsInt, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateLeaveTypeDto {
  @IsOptional()
  @IsString()
  leavetypecode?: string;

  @IsOptional()
  @IsString()
  leavetypename?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyid?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statuscd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  leavetypecategorycd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  leavetypecd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maximumleavedays?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  daysbeforeleave?: number;

  @IsOptional()
  @IsBoolean()
  isdocumentmandatory?: boolean;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

import { IsString, IsOptional, IsInt, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateSalaryTypeDto {
  @IsOptional()
  @IsString()
  salarytypecode?: string;

  @IsOptional()
  @IsString()
  salarytypename?: string;

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
  salarytypecategorycd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  salarytypecd?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortorder?: number;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

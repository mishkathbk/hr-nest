import { IsString, IsOptional, IsInt, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateEmployeeWarningDto {
  @IsInt()
  @Type(() => Number)
  employeeid: number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  warningmessage?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statuscd?: number;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

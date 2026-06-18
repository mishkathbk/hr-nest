import { IsString, IsOptional, IsInt, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class UpdateSalaryCertificateReqDto {
  @IsOptional()
  @IsString()
  reqno?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  reqforcd?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  passportno?: string;

  @IsOptional()
  @IsString()
  issuedto?: string;

  @IsOptional()
  @IsString()
  approvedby?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statuscd?: number;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

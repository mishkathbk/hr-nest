import { IsString, IsOptional, IsInt, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class UpdateSalaryCertificateReqDto {
  @IsOptional()
  @IsString()
  reqno?: string;

  @IsOptional()
  @IsString()
  reqdate?: string;

  @IsOptional()
  @IsString()
  passporto?: string;

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

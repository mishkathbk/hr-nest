import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSalaryCertificateReqDto {
  @IsOptional()
  @IsString()
  reqNo?: string;

  @IsOptional()
  @IsString()
  reqDate?: string;

  @IsOptional()
  @IsString()
  passporto?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statusCd?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

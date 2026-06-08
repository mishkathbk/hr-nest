import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePolicyDto {
  @IsOptional()
  @IsString()
  policyNo?: string;

  @IsOptional()
  @IsString()
  policyMessage?: string;

  @IsOptional()
  @IsString()
  regulationMessage?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  documentGroupId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statusCd?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

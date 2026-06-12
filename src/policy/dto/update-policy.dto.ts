import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePolicyDto {
  @IsOptional()
  @IsString()
  policyno?: string;

  @IsOptional()
  @IsString()
  policymessage?: string;

  @IsOptional()
  @IsString()
  regulationmessage?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  documentgroupid?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statuscd?: number;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

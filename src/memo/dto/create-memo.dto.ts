import { IsString, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMemoDto {
  @IsString()
  memocode: string;

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  employeeids: number[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  memotypecd?: number;

  @IsOptional()
  @IsString()
  memosubject?: string;

  @IsOptional()
  @IsString()
  memotext?: string;

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

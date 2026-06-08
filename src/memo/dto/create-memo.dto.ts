import { IsString, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMemoDto {
  @IsString()
  memoCode: string;

  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  employeeIds: number[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  memoTypeCd?: number;

  @IsOptional()
  @IsString()
  memoSubject?: string;

  @IsOptional()
  @IsString()
  memoText?: string;

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

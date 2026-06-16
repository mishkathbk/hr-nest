import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class MemoEmployeeDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  memoemployeeid?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  memoid?: number;

  @IsInt()
  @Type(() => Number)
  employeeid: number;
}

export class CreateMemoDto {
  @IsString()
  memocode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemoEmployeeDto)
  employeeDTOlist: MemoEmployeeDto[];

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

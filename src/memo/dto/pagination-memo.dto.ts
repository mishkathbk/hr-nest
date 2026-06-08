import { IsOptional, IsString, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationMemoDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  filterList?: any[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;
}

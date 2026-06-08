import {
  IsInt,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsString,
  ValidateNested,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// attendancesourcetypecd values
// Note: In your DB these might be 6700001, 6700002, etc. (we'll just use the constant for mobile checks)
// Adjust this to match your actual mobile lookup ID if it's 6700002.
export const ATTENDANCE_SOURCE_MOBILE = 2; // Assuming 2 is mobile, or 6700002 if that's your DB lookup id

export class AttendanceDetDTO {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  attendanceDetId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  attendanceId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  typeId?: number; // 1 = Check-in, 2 = Check-out

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  attendanceSourceTypeCd?: number;

  @IsOptional()
  @IsString()
  attTime?: string; // 'HH:mm' from the client
}

export class SaveByDateDto {
  @IsOptional()
  @Type(() => Number)
  attendanceId?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  employeeId: number;

  @IsDateString()
  attendanceDate: string; // 'YYYY-MM-DDTHH:mm:ss'

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  attendanceSourceTypeCd?: number;

  @IsOptional()
  @IsBoolean()
  isManual?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceDetDTO)
  attendanceDetDTOList?: AttendanceDetDTO[];
}

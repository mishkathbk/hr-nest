import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * UpdateLeaveCalendarDto
 *
 * Mirrors the Express updateData validation — all core fields are required.
 * The LeaveCalendarId comes from the URL param (:id), not the body.
 */
export class UpdateLeaveCalendarDto {
  @IsString()
  @IsNotEmpty({ message: "LeaveCode is required" })
  leavecode: string;

  @IsString()
  @IsNotEmpty({ message: "LeaveName is required" })
  leavename: string;

  @IsDateString({}, { message: "FromDate must be a valid ISO date string" })
  @IsNotEmpty({ message: "FromDate is required" })
  fromdate: string;

  @IsDateString({}, { message: "ToDate must be a valid ISO date string" })
  @IsNotEmpty({ message: "ToDate is required" })
  todate: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  statuscd?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}

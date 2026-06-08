import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * UpdateLeaveCalendarDto
 *
 * Mirrors the Express updateData validation — all core fields are required.
 * The LeaveCalendarId comes from the URL param (:id), not the body.
 */
export class UpdateLeaveCalendarDto {
  @IsString()
  @IsNotEmpty({ message: 'LeaveCode is required' })
  LeaveCode: string;

  @IsString()
  @IsNotEmpty({ message: 'LeaveName is required' })
  LeaveName: string;

  @IsDateString({}, { message: 'FromDate must be a valid ISO date string' })
  @IsNotEmpty({ message: 'FromDate is required' })
  FromDate: string;

  @IsDateString({}, { message: 'ToDate must be a valid ISO date string' })
  @IsNotEmpty({ message: 'ToDate is required' })
  ToDate: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  StatusCd?: number;

  @IsOptional()
  @IsString()
  Description?: string;
}

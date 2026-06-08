import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * CreateLeaveCalendarDto
 *
 * Replaces the manual validation in the Express service:
 *   if (!LeaveCode) errors.push('LeaveCode is required');
 *
 * ValidationPipe + class-validator handles this automatically and
 * returns a 400 with descriptive messages via HttpExceptionFilter.
 */
export class CreateLeaveCalendarDto {
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

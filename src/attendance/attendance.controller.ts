import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { GetByDateDto } from './dto/get-by-date.dto';
import { SaveByDateDto } from './dto/save-by-date.dto';
import { MonthlyGridDto } from './dto/monthly-grid.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('attendance')
// @UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // POST /api/attendance/get-by-date
  // Called when user clicks a cell in the grid → opens the popup modal
  // Body: { employeeId, date: 'YYYY-MM-DD' }
  @Post('get-by-date')
  @HttpCode(HttpStatus.OK)
  getByDate(
    @Body() dto: GetByDateDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.attendanceService.getByDate(dto, companyId);
  }

  // POST /api/attendance/save-by-date
  // Called when user clicks "Update" button in the modal
  // Body: { employeeId, date, checkIn?, checkOut?, isManual?, notes? }
  @Post('save-by-date')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Attendance saved successfully')
  saveByDate(
    @Body() dto: SaveByDateDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.attendanceService.saveByDate(dto, currentId, companyId);
  }

  // POST /api/attendance/monthly-grid
  // Called on page load / filter change → builds full calendar table
  // Body: { month, year, departmentId?, employeeId? }
  @Post('monthly-grid')
  @HttpCode(HttpStatus.OK)
  getMonthlyGrid(
    @Body() dto: MonthlyGridDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.attendanceService.getMonthlyGrid(dto, companyId);
  }
}

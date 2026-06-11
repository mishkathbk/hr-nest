import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LeaveCalendarService } from './leave-calendar.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { CreateLeaveCalendarDto } from './dto/create-leave-calendar.dto';
import { UpdateLeaveCalendarDto } from './dto/update-leave-calendar.dto';
import { PaginationLeaveCalendarDto } from './dto/pagination-leave-calendar.dto';

@Controller('leave-calendar')
// @UseGuards(JwtAuthGuard)
export class LeaveCalendarController {
  constructor(private readonly leaveCalendarService: LeaveCalendarService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────


  // POST /api/leave-calendar/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post('list/pagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationLeaveCalendarDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.leaveCalendarService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/leave-calendar
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.leaveCalendarService.list(companyId, inactive === 'true');
  }

  // GET /api/leave-calendar/:id
  @Get(':id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.leaveCalendarService.getByKey(id);
  }

  // POST /api/leave-calendar
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreateLeaveCalendarDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.leaveCalendarService.saveData(dto, currentId, companyId);
  }

  // PUT /api/leave-calendar/:id
  @Put(':id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveCalendarDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.leaveCalendarService.updateData(id, dto, currentId, companyId);
  }

  // DELETE /api/leave-calendar/:id
  @Delete(':id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.leaveCalendarService.deleteData(id, currentId);
  }
}

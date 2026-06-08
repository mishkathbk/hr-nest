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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

import { EmployeeWarningService } from './employee-warning.service';
import { CreateEmployeeWarningDto } from './dto/create-employee-warning.dto';
import { UpdateEmployeeWarningDto } from './dto/update-employee-warning.dto';
import { PaginationEmployeeWarningDto } from './dto/pagination-employee-warning.dto';

@Controller('employee-warning')
// @UseGuards(JwtAuthGuard)
export class EmployeeWarningController {
  constructor(
    private readonly employeeWarningService: EmployeeWarningService,
  ) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // GET /api/employee-warning/list/search?q=keyword
  @Get('list/search')
  listSearch(@Query('q') q = '', @CurrentUser('companyId') companyId: number) {
    return this.employeeWarningService.listSearch(q, companyId);
  }

  // POST /api/employee-warning/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post('list/pagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationEmployeeWarningDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.employeeWarningService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/employee-warning
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.employeeWarningService.list(
      companyId,
      inactive === 'true',
    );
  }

  // GET /api/employee-warning/:id
  @Get(':id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.employeeWarningService.getByKey(id);
  }

  // POST /api/employee-warning
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreateEmployeeWarningDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.employeeWarningService.saveData(dto, currentId, companyId);
  }

  // PUT /api/employee-warning/:id
  @Put(':id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeWarningDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.employeeWarningService.updateData(
      id,
      dto,
      currentId,
      companyId,
    );
  }

  // DELETE /api/employee-warning/:id
  @Delete(':id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.employeeWarningService.deleteData(id, currentId);
  }
}

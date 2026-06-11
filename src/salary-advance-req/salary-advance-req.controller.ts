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

import { SalaryAdvanceReqService } from './salary-advance-req.service';
import { CreateSalaryAdvanceReqDto } from './dto/create-salary-advance-req.dto';
import { UpdateSalaryAdvanceReqDto } from './dto/update-salary-advance-req.dto';
import { PaginationSalaryAdvanceReqDto } from './dto/pagination-salary-advance-req.dto';

@Controller('salary-advance-req')
// @UseGuards(JwtAuthGuard)
export class SalaryAdvanceReqController {
  constructor(
    private readonly salaryAdvanceReqService: SalaryAdvanceReqService,
  ) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // POST /api/salary-advance-req/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post('list/pagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationSalaryAdvanceReqDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryAdvanceReqService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/salary-advance-req
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryAdvanceReqService.list(
      companyId,
      inactive === 'true',
    );
  }

  // GET /api/salary-advance-req/:id
  @Get(':id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.salaryAdvanceReqService.getByKey(id);
  }

  // POST /api/salary-advance-req
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreateSalaryAdvanceReqDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryAdvanceReqService.saveData(dto, currentId, companyId);
  }

  // PUT /api/salary-advance-req/:id
  @Put(':id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryAdvanceReqDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryAdvanceReqService.updateData(
      id,
      dto,
      currentId,
      companyId,
    );
  }

  // DELETE /api/salary-advance-req/:id
  @Delete(':id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.salaryAdvanceReqService.deleteData(id, currentId);
  }
}

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
  ParseBoolPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { PaginationMemoDto } from './dto/pagination-memo.dto';

@Controller('hrms/memo')
@UseGuards(JwtAuthGuard)
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // POST /api/hrms/memo/listPagination
  @Post('listPagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationMemoDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/hrms/memo  (also handles ?inactive=true)
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.list(companyId, inactive === 'true');
  }

  // GET /api/hrms/memo/GetById/:id
  @Get('GetById/:id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.memoService.getByKey(id);
  }

  // POST /api/hrms/memo/Create
  @Post('Create')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreateMemoDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.saveData(dto, currentId, companyId);
  }

  // PUT /api/hrms/memo/Update/:id
  @Put('Update/:id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMemoDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.updateData(id, dto, currentId, companyId);
  }

  // PUT /api/hrms/memo/UpdateActiveStatus/:id/:isactive
  @Put('UpdateActiveStatus/:id/:isactive')
  @ResponseMessage('Status updated successfully')
  UpdateActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('isactive', ParseBoolPipe) isactive: boolean,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.memoService.UpdateActiveStatus(id, isactive, currentId);
  }

  // DELETE /api/hrms/memo/Delete/:id
  @Delete('Delete/:id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.memoService.deleteData(id, currentId);
  }
}

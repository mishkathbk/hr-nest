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

import { MemoService } from './memo.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { PaginationMemoDto } from './dto/pagination-memo.dto';

@Controller('memo')
// @UseGuards(JwtAuthGuard)
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // GET /api/memo/list/search?q=keyword
  @Get('list/search')
  listSearch(@Query('q') q = '', @CurrentUser('companyId') companyId: number) {
    return this.memoService.listSearch(q, companyId);
  }

  // POST /api/memo/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post('list/pagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationMemoDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/memo
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.list(
      companyId,
      inactive === 'true',
    );
  }

  // GET /api/memo/:id
  @Get(':id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.memoService.getByKey(id);
  }

  // POST /api/memo
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreateMemoDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.saveData(dto, currentId, companyId);
  }

  // PUT /api/memo/:id
  @Put(':id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMemoDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.memoService.updateData(
      id,
      dto,
      currentId,
      companyId,
    );
  }

  // DELETE /api/memo/:id
  @Delete(':id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.memoService.deleteData(id, currentId);
  }
}

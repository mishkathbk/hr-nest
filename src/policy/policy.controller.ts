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

import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PaginationPolicyDto } from './dto/pagination-policy.dto';

@Controller('policy')
// @UseGuards(JwtAuthGuard)
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // GET /api/policy/list/search?q=keyword
  @Get('list/search')
  listSearch(@Query('q') q = '', @CurrentUser('companyId') companyId: number) {
    return this.policyService.listSearch(q, companyId);
  }

  // POST /api/policy/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post('list/pagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationPolicyDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
 
  // GET /api/policy
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.list(companyId, inactive === 'true');
  }

  // GET /api/policy/:id
  @Get(':id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.policyService.getByKey(id);
  }

  // POST /api/policy
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreatePolicyDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.saveData(dto, currentId, companyId);
  }

  // PUT /api/policy/:id
  @Put(':id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePolicyDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.updateData(id, dto, currentId, companyId);
  }

  // DELETE /api/policy/:id
  @Delete(':id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.policyService.deleteData(id, currentId);
  }
}

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

import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PaginationPolicyDto } from './dto/pagination-policy.dto';

@Controller('hrms/policy')
@UseGuards(JwtAuthGuard)
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // POST /api/hrms/policy/listPagination
  @Post('listPagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationPolicyDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/hrms/policy
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.list(companyId, inactive === 'true');
  }

  // GET /api/hrms/policy/GetById/:id
  @Get('GetById/:id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.policyService.getByKey(id);
  }

  // POST /api/hrms/policy/Create
  @Post('Create')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreatePolicyDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.saveData(dto, currentId, companyId);
  }

  // PUT /api/hrms/policy/Update/:id
  @Put('Update/:id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePolicyDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.policyService.updateData(id, dto, currentId, companyId);
  }

  // PUT /api/hrms/policy/UpdateActiveStatus/:id/:isactive
  @Put('UpdateActiveStatus/:id/:isactive')
  @ResponseMessage('Status updated successfully')
  UpdateActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('isactive', ParseBoolPipe) isactive: boolean,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.policyService.UpdateActiveStatus(id, isactive, currentId);
  }

  // DELETE /api/hrms/policy/Delete/:id
  @Delete('Delete/:id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.policyService.deleteData(id, currentId);
  }
}

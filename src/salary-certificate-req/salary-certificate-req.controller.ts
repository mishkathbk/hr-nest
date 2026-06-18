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

import { SalaryCertificateReqService } from './salary-certificate-req.service';
import { CreateSalaryCertificateReqDto } from './dto/create-salary-certificate-req.dto';
import { UpdateSalaryCertificateReqDto } from './dto/update-salary-certificate-req.dto';
import { PaginationSalaryCertificateReqDto } from './dto/pagination-salary-certificate-req.dto';

@Controller('hrms/salary-certificate-req')
// @UseGuards(JwtAuthGuard)
export class SalaryCertificateReqController {
  constructor(
    private readonly salaryCertificateReqService: SalaryCertificateReqService,
  ) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // POST /api/salary-certificate-req/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post('list/pagination')
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationSalaryCertificateReqDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryCertificateReqService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/salary-certificate-req
  @Get()
  list(
    @Query('inactive') inactive: string,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryCertificateReqService.list(
      companyId,
      inactive === 'true',
    );
  }

  // GET /api/salary-certificate-req/:id
  @Get(':id')
  getByKey(@Param('id', ParseIntPipe) id: number) {
    return this.salaryCertificateReqService.getByKey(id);
  }

  // POST /api/salary-certificate-req
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Created successfully')
  saveData(
    @Body() dto: CreateSalaryCertificateReqDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryCertificateReqService.saveData(dto, currentId, companyId);
  }

  // PUT /api/salary-certificate-req/:id
  @Put(':id')
  @ResponseMessage('Updated successfully')
  updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryCertificateReqDto,
    @CurrentUser('currentId') currentId: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.salaryCertificateReqService.updateData(
      id,
      dto,
      currentId,
      companyId,
    );
  }

  // PUT /api/salary-certificate-req/UpdateActiveStatus/:id/:isactive
  @Put('UpdateActiveStatus/:id/:isactive')
  @ResponseMessage('Status updated successfully')
  UpdateActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('isactive', ParseBoolPipe) isactive: boolean,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.salaryCertificateReqService.UpdateActiveStatus(id, isactive, currentId);
  }

  // DELETE /api/salary-certificate-req/:id
  @Delete(':id')
  @ResponseMessage('Deleted successfully')
  deleteData(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.salaryCertificateReqService.deleteData(id, currentId);
  }
}

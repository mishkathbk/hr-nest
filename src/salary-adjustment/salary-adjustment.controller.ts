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
  ParseBoolPipe,
  // UseGuards,
} from "@nestjs/common";
// import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";  
import { CurrentUser } from "../common/decorators/user.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";

import { SalaryAdjustmentService } from "./salary-adjustment.service";
import { CreateSalaryAdjustmentDto } from "./dto/create-salary-adjustment.dto";
import { UpdateSalaryAdjustmentDto } from "./dto/update-salary-adjustment.dto";
import { PaginationSalaryAdjustmentDto } from "./dto/pagination-salary-adjustment.dto";

@Controller("hrms/salary-adjustment")
// @UseGuards(JwtAuthGuard)
export class SalaryAdjustmentController {
  constructor(private readonly salaryAdjustmentService: SalaryAdjustmentService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // POST /api/salary-adjustment/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post("ListPagination")
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationSalaryAdjustmentDto,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryAdjustmentService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/salary-adjustment
  @Get("GetList")
  list(
    @Query("inactive") inactive: string,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryAdjustmentService.list(companyId, inactive === "true");
  }

  // GET /api/salary-adjustment/:id
  @Get("GetById/:id")
  getByKey(@Param("id", ParseIntPipe) id: number) {
    return this.salaryAdjustmentService.getByKey(id);
  }

  // POST /api/salary-adjustment
  @Post("Create")
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Created successfully")
  saveData(
    @Body() dto: CreateSalaryAdjustmentDto,
    @CurrentUser("currentId") currentId: number,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryAdjustmentService.saveData(dto, currentId, companyId);
  }

  @Put("UpdateActiveStatus/:id/:isactive")
  @ResponseMessage("Status updated successfully")
  UpdateActiveStatus(
    @Param("id", ParseIntPipe) id: number,
    @Param("isactive", ParseBoolPipe) isactive: boolean,
    @CurrentUser("currentId") currentId: number,
  ) {
    return this.salaryAdjustmentService.UpdateActiveStatus(id, isactive, currentId);
  }

  // PUT /api/salary-adjustment/:id
  @Put("Update/:id")
  @ResponseMessage("Updated successfully")
  updateData(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryAdjustmentDto,
    @CurrentUser("currentId") currentId: number,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryAdjustmentService.updateData(id, dto, currentId, companyId);
  }

  // DELETE /api/salary-adjustment/:id
  @Delete("Delete/:id")
  @ResponseMessage("Deleted successfully")
  deleteData(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser("currentId") currentId: number,
  ) {
    return this.salaryAdjustmentService.deleteData(id, currentId);
  }
}

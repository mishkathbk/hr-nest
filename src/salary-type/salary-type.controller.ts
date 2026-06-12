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
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";

import { SalaryTypeService } from "./salary-type.service";
import { CreateSalaryTypeDto } from "./dto/create-salary-type.dto";
import { UpdateSalaryTypeDto } from "./dto/update-salary-type.dto";
import { PaginationSalaryTypeDto } from "./dto/pagination-salary-type.dto";
import { UpdateActiveStatusDto } from "./dto/updateactivestatus.dto";

@Controller("hrms/salary-type")
@UseGuards(JwtAuthGuard)
export class SalaryTypeController {
  constructor(private readonly salaryTypeService: SalaryTypeService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // POST /api/salary-type/listPagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post("listPagination")
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationSalaryTypeDto,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryTypeService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/salary-type
  @Get()
  list(
    @Query("inactive") inactive: string,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryTypeService.list(companyId, inactive === "true");
  }

  // GET /api/salary-type/:id
  @Get("GetById/:id")
  getByKey(@Param("id", ParseIntPipe) id: number) {
    return this.salaryTypeService.getByKey(id);
  }

  // POST /api/salary-type
  @Post("Create")
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Created successfully")
  saveData(
    @Body() dto: CreateSalaryTypeDto,
    @CurrentUser("currentId") currentId: number,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryTypeService.saveData(dto, currentId, companyId);
  }

  // PUT /api/salary-type/:id
  @Put("Update/:id")
  @ResponseMessage("Updated successfully")
  updateData(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryTypeDto,
    @CurrentUser("currentId") currentId: number,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.salaryTypeService.updateData(id, dto, currentId, companyId);
  }

  @Put("UpdateActiveStatus/:id/:isactive")
  @ResponseMessage("Status updated successfully")
  UpdateActiveStatus(
    @Param("id", ParseIntPipe) id: number,
    @Param("isactive", ParseBoolPipe) isactive: boolean,
    @CurrentUser("currentId") currentId: number,
  ) {
    return this.salaryTypeService.UpdateActiveStatus(id, isactive, currentId);
  }

  // DELETE /api/salary-type/:id
  @Delete("Delete/:id")
  @ResponseMessage("Deleted successfully")
  deleteData(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser("currentId") currentId: number,
  ) {
    return this.salaryTypeService.deleteData(id, currentId);
  }
}

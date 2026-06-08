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
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";

import { LeaveTypeService } from "./leave-type.service";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { PaginationLeaveTypeDto } from "./dto/pagination-leave-type.dto";

@Controller("leave-type")
// @UseGuards(JwtAuthGuard)
export class LeaveTypeController {
  constructor(private readonly LeaveTypeService: LeaveTypeService) {}

  // ── Specific list routes MUST be declared before /:id ───────────────────

  // GET /api/leave-calendar/list/search?q=keyword
  @Get("list/search")
  listSearch(@Query("q") q = "", @CurrentUser("companyId") companyId: number) {
    return this.LeaveTypeService.listSearch(q, companyId);
  }

  // POST /api/leave-calendar/list/pagination
  // Body: { search?, filterList?, offset?, limit? }
  @Post("list/pagination")
  @HttpCode(HttpStatus.OK)
  listPagination(
    @Body() dto: PaginationLeaveTypeDto,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.LeaveTypeService.listPagination(dto, companyId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  // GET /api/leave-calendar
  @Get()
  list(
    @Query("inactive") inactive: string,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.LeaveTypeService.list(companyId, inactive === "true");
  }

  // GET /api/leave-calendar/:id
  @Get(":id")
  getByKey(@Param("id", ParseIntPipe) id: number) {
    return this.LeaveTypeService.getByKey(id);
  }

  // POST /api/leave-calendar
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Created successfully")
  saveData(
    @Body() dto: CreateLeaveTypeDto,
    @CurrentUser("currentId") currentId: number,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.LeaveTypeService.saveData(dto, currentId, companyId);
  }

  // PUT /api/leave-calendar/:id
  @Put(":id")
  @ResponseMessage("Updated successfully")
  updateData(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveTypeDto,
    @CurrentUser("currentId") currentId: number,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.LeaveTypeService.updateData(id, dto, currentId, companyId);
  }

  // DELETE /api/leave-calendar/:id
  @Delete(":id")
  @ResponseMessage("Deleted successfully")
  deleteData(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser("currentId") currentId: number,
  ) {
    return this.LeaveTypeService.deleteData(id, currentId);
  }
}

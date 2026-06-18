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
import { PayslipService } from "./payslip.service";
import { GetMyPayslipDto } from "./dto/get-my-payslip.dto";

@Controller("hrms/payslip")  
// @UseGuards(JwtAuthGuard)
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  @Get("my")
  async getMyPayslipList(
    @CurrentUser() user: any,
    @Query() dto: GetMyPayslipDto,
  ) {
    return this.payslipService.getMyPayslipList(
      user.employeeId,
      user.companyId,
      dto,
    );
  }

  @Get("my/:payrollGenerationId")
  async getMyPayslipDetail(
    @CurrentUser() user: any,
    @Param("payrollGenerationId", ParseIntPipe) payrollGenerationId: number,
  ) {
    return this.payslipService.getMyPayslipDetail(
      payrollGenerationId,
      user.employeeId,
      user.companyId,
    );
  }
}

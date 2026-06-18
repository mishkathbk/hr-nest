import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";
import { EmployeePayslipService } from "./employee-payslip.service";
import { SendPayslipEmailDto } from "./dto/send-payslip-email.dto";

@Controller("hrms/payslip")
export class EmployeePayslipController {
  constructor(private readonly employeePayslipService: EmployeePayslipService) {}

  @Post("send-email")
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Payslip email sent successfully")
  sendEmail(
    @Body() dto: SendPayslipEmailDto,
    @CurrentUser("companyId") companyId: number,
  ) {
    return this.employeePayslipService.sendPayslipEmail(companyId, dto);
  }
}

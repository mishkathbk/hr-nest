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
import { EmployeePayslipService } from "./employee-payslip.service";

@Controller("payslip")
// @UseGuards(JwtAuthGuard)
export class EmployeePayslipController {
  constructor(private readonly employeePayslipService: EmployeePayslipService) {}


}

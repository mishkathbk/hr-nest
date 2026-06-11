import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayrollGenerationService } from './payroll-generation.service';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';
import { GetPayrollListDto } from './dto/get-payroll-list.dto';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('payroll-generation')
// @UseGuards(JwtAuthGuard)
export class PayrollGenerationController {
  constructor(
    private readonly payrollGenerationService: PayrollGenerationService,
  ) {}

  // POST /api/payroll-generation/calculate
  // Calculates salary for one employee or all employees for the given month/year.
  // Creates/overwrites draft payroll records (skips already-approved ones).
  // Body: { year, month, employeeId? }
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Salary calculated successfully')
  calculateSalary(
    @Body() dto: CalculatePayrollDto,
    @CurrentUser('companyId') companyId: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.payrollGenerationService.calculateSalary(dto, companyId, currentId);
  }

  // POST /api/payroll-generation/list
  // Returns the payroll summary grid: employee name, additions, deductions, net.
  // Also returns overall summary totals (shown at the bottom of the UI table).
  // Body: { year, month, employeeId? }
  @Post('list')
  @HttpCode(HttpStatus.OK)
  getPayrollList(
    @Body() dto: GetPayrollListDto,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.payrollGenerationService.getPayrollList(dto, companyId);
  }

  // POST /api/payroll-generation/generate
  // Approves selected payroll records — sets isapprove=true, saves approver info.
  // Called when user clicks "Generate Payroll" after selecting employees.
  // Body: { payrollGenerationIds: number[] }
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Payroll generated successfully')
  generatePayroll(
    @Body() dto: GeneratePayrollDto,
    @CurrentUser('companyId') companyId: number,
    @CurrentUser('currentId') currentId: number,
  ) {
    return this.payrollGenerationService.generatePayroll(dto, companyId, currentId);
  }

  // GET /api/payroll-generation/detail/:id
  // Returns line-by-line salary breakdown for a single payroll record.
  // Called when user clicks the "View" button on a row.
  @Get('detail/:id')
  getPayrollDetail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('companyId') companyId: number,
  ) {
    return this.payrollGenerationService.getPayrollDetail(id, companyId);
  }
}

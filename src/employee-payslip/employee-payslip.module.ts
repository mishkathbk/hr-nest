import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { EmployeePayslipController } from "./employee-payslip.controller";
import { EmployeePayslipService } from "./employee-payslip.service";

@Module({
  imports: [PrismaModule],
  controllers: [EmployeePayslipController],
  providers: [EmployeePayslipService],
})
export class EmployeePayslipModule {}

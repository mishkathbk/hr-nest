import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LeaveCalendarModule } from './leave-calendar/leave-calendar.module';
import { SalaryTypeModule } from './salary-type/salary-type.module';
import { LeaveTypeModule } from './leave-type/leave-type.module';
import { PolicyModule } from './policy/policy.module';
import { SalaryCertificateReqModule } from './salary-certificate-req/salary-certificate-req.module';
import { SalaryAdvanceReqModule } from './salary-advance-req/salary-advance-req.module';
import { EmployeeWarningModule } from './employee-warning/employee-warning.module';
import { MemoModule } from './memo/memo.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollGenerationModule } from './payroll-generation/payroll-generation.module';
import { SalaryAdjustmentModule } from './salary-adjustment/salary-adjustment.module';
import { PayslipModule } from './payslip/payslip.module';
import { EmployeePayslipModule } from './employee-payslip/employee-payslip.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Load .env globally — all modules can inject ConfigService
    ConfigModule.forRoot({ isGlobal: true }),

    PrismaModule,

    // Feature modules
    LeaveCalendarModule,
    SalaryTypeModule,
    LeaveTypeModule,
    PolicyModule,
    SalaryCertificateReqModule,
    SalaryAdvanceReqModule,
    EmployeeWarningModule,
    MemoModule,
    AttendanceModule,
    PayrollGenerationModule,
    SalaryAdjustmentModule,
    PayslipModule,
    EmployeePayslipModule,
    HealthModule
  ],
  controllers: [],
})
export class AppModule {}

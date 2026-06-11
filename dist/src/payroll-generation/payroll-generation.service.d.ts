import { PrismaService } from "../prisma/prisma.service";
import { CalculatePayrollDto } from "./dto/calculate-payroll.dto";
import { GetPayrollListDto } from "./dto/get-payroll-list.dto";
import { GeneratePayrollDto } from "./dto/generate-payroll.dto";
export declare class PayrollGenerationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateSalary(dto: CalculatePayrollDto, companyId: number, currentId: number): Promise<{
        processed: number;
        skipped: number;
        processedEmployeeIds: number[];
        skippedEmployeeIds: number[];
    }>;
    getPayrollList(dto: GetPayrollListDto, companyId: number): Promise<{
        year: number;
        month: number;
        rows: {
            payrollgenerationid: number;
            employeeid: number;
            employeecode: string;
            employeename: string;
            departmentname: string;
            designationname: string;
            payrollyear: number;
            payrollmonth: number;
            additions: number;
            deductions: number;
            totalamount: number;
            totaldays: number;
            totalhours: number;
            isapprove: boolean;
            approvedby: number;
            approveddate: Date;
        }[];
        summary: {
            totalEmployees: number;
            totalAdditions: number;
            totalDeductions: number;
            totalPayable: number;
        };
    }>;
    generatePayroll(dto: GeneratePayrollDto, companyId: number, currentId: number): Promise<{
        approved: number;
        payrollGenerationIds: number[];
    }>;
    getPayrollDetail(payrollGenerationId: number, companyId: number): Promise<{
        payrollgenerationid: number;
        employee: {
            hrm_department: {
                departmentname: string;
            };
            hrm_designation: {
                designationname: string;
            };
            employeeid: number;
            employeecode: string;
            employeename: string;
        };
        payrollyear: number;
        payrollmonth: number;
        totaldays: number;
        totalhours: number;
        totalamount: number;
        isapprove: boolean;
        approvedby: number;
        approveddate: Date;
        additions: {
            payrollgenerationdetid: number;
            salarytypeid: number;
            salarytypecode: string;
            salarytypename: string;
            amount: number;
            notes: string;
        }[];
        deductions: {
            payrollgenerationdetid: number;
            salarytypeid: number;
            salarytypecode: string;
            salarytypename: string;
            amount: number;
            notes: string;
        }[];
        summary: {
            totalAdditions: number;
            totalDeductions: number;
            netPayable: number;
        };
    }>;
    private getAttendanceSummary;
}

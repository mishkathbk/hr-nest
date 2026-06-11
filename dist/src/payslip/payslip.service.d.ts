import { PrismaService } from "../prisma/prisma.service";
import { GetMyPayslipDto } from "./dto/get-my-payslip.dto";
export declare class PayslipService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getMyPayslipList(employeeId: number, companyId: number, dto: GetMyPayslipDto): Promise<{
        rows: {
            payrollgenerationid: number;
            payrollyear: number;
            payrollmonth: number;
            additions: number;
            deductions: number;
            totalamount: number;
        }[];
    }>;
    getMyPayslipDetail(payrollGenerationId: number, employeeId: number, companyId: number): Promise<{
        payrollgenerationid: number;
        payrollyear: number;
        payrollmonth: number;
        employee: {
            hrm_department: {
                departmentname: string;
            };
            hrm_designation: {
                designationname: string;
            };
            employeecode: string;
            employeename: string;
        };
        lines: {
            payrollgenerationdetid: number;
            salarytypename: string;
            addamount: number;
            dedamount: number;
            notes: string;
        }[];
        summary: {
            totalAdditions: number;
            totalDeductions: number;
            netPayable: number;
        };
    }>;
}

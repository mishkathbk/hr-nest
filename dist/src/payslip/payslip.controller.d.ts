import { PayslipService } from "./payslip.service";
import { GetMyPayslipDto } from "./dto/get-my-payslip.dto";
export declare class PayslipController {
    private readonly payslipService;
    constructor(payslipService: PayslipService);
    getMyPayslipList(user: any, dto: GetMyPayslipDto): Promise<{
        rows: {
            payrollgenerationid: number;
            payrollyear: number;
            payrollmonth: number;
            additions: number;
            deductions: number;
            totalamount: number;
        }[];
    }>;
    getMyPayslipDetail(user: any, payrollGenerationId: number): Promise<{
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

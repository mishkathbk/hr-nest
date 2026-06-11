import { PrismaService } from "../prisma/prisma.service";
import { SendPayslipEmailDto } from "./dto/send-payslip-email.dto";
export declare class EmployeePayslipService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendPayslipEmail(companyId: number, dto: SendPayslipEmailDto): Promise<void>;
}

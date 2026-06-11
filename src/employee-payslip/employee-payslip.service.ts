import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SendPayslipEmailDto } from "./dto/send-payslip-email.dto";

@Injectable()
export class EmployeePayslipService {
  private readonly logger = new Logger(EmployeePayslipService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendPayslipEmail(
    companyId: number,
    dto: SendPayslipEmailDto,
  ) {
    this.logger.log(
      `GetMyPayslipList | companyId=${companyId}`,
    );

    return;
  }
}

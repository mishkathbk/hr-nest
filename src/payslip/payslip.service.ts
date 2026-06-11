import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetMyPayslipDto } from "./dto/get-my-payslip.dto";

@Injectable()
export class PayslipService {
  private readonly logger = new Logger(PayslipService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Get My Payslip List ──────────────────────────────────────────────────────
  // Returns all months where payroll was generated for the logged-in employee

  async getMyPayslipList(
    employeeId: number,
    companyId: number,
    dto: GetMyPayslipDto,
  ) {
    this.logger.log(
      `GetMyPayslipList | employeeId=${employeeId}, companyId=${companyId}`,
    );

    const records = await this.prisma.hrm_payrollgeneration.findMany({
      where: {
        employeeid: employeeId,
        companyid: companyId,
        isapprove: true,
        isdeleted: { not: true },
        ...(dto.year ? { payrollyear: dto.year } : {}),
        ...(dto.month ? { payrollmonth: dto.month } : {}),
      },
      include: {
        hrm_payrollgenerationdet: {
          where: { isdeleted: { not: true } },
        },
      },
      orderBy: [{ payrollyear: "desc" }, { payrollmonth: "desc" }],
    });

    const rows = records.map((r) => {
      const additions = r.hrm_payrollgenerationdet.reduce(
        (sum, d) => sum + Number(d.addamount ?? 0),
        0,
      );
      const deductions = r.hrm_payrollgenerationdet.reduce(
        (sum, d) => sum + Number(d.dedamount ?? 0),
        0,
      );

      return {
        payrollgenerationid: r.payrollgenerationid,
        payrollyear: r.payrollyear,
        payrollmonth: r.payrollmonth,
        additions: Math.round(additions * 100) / 100,
        deductions: Math.round(deductions * 100) / 100,
        totalamount: Math.round((additions - deductions) * 100) / 100,
      };
    });

    return { rows };
  }

  // ─── Get My Payslip Detail ────────────────────────────────────────────────────
  // Returns line-by-line breakdown for one month — shown in the modal

  async getMyPayslipDetail(
    payrollGenerationId: number,
    employeeId: number,
    companyId: number,
  ) {
    this.logger.log(
      `GetMyPayslipDetail | payrollGenerationId=${payrollGenerationId}, employeeId=${employeeId}`,
    );

    // Verify this record belongs to the logged-in employee
    const header = await this.prisma.hrm_payrollgeneration.findFirst({
      where: {
        payrollgenerationid: payrollGenerationId,
        employeeid: employeeId,
        companyid: companyId,
        isapprove: true,
        isdeleted: { not: true },
      },
    });

    if (!header) throw new NotFoundException("Payslip not found");

    const det = await this.prisma.hrm_payrollgenerationdet.findMany({
      where: {
        payrollgenerationid: payrollGenerationId,
        isdeleted: { not: true },
      },
      orderBy: { payrollgenerationdetid: "asc" },
    });

    // Fetch salary type names
    const salaryTypeIds = [...new Set(det.map((d) => d.salarytypeid))];
    const salaryTypes = await this.prisma.hrm_salarytype.findMany({
      where: { salarytypeid: { in: salaryTypeIds } },
      select: {
        salarytypeid: true,
        salarytypename: true,
        salarytypecategorycd: true,
      },
    });
    const stMap = new Map(salaryTypes.map((s) => [s.salarytypeid, s]));

    // Fetch employee info for modal header (shows employee name like "HR" in UI)
    const emp = await this.prisma.hrm_employee.findUnique({
      where: { employeeid: employeeId },
      select: {
        employeename: true,
        employeecode: true,
        hrm_department: { select: { departmentname: true } },
        hrm_designation: { select: { designationname: true } },
      },
    });

    const lines = det.map((d) => {
      const st = stMap.get(d.salarytypeid);
      const addamount = Number(d.addamount ?? 0);
      const dedamount = Number(d.dedamount ?? 0);
      return {
        payrollgenerationdetid: d.payrollgenerationdetid,
        salarytypename: st?.salarytypename ?? null,
        addamount: addamount > 0 ? addamount : null, // null shows as "-" in UI
        dedamount: dedamount > 0 ? dedamount : null, // null shows as "-" in UI
        notes: d.notes1 ?? null,
      };
    });

    const totalAdditions = det.reduce(
      (s, d) => s + Number(d.addamount ?? 0),
      0,
    );
    const totalDeductions = det.reduce(
      (s, d) => s + Number(d.dedamount ?? 0),
      0,
    );

    return {
      payrollgenerationid: header.payrollgenerationid,
      payrollyear: header.payrollyear,
      payrollmonth: header.payrollmonth,
      employee: emp,
      lines,
      summary: {
        totalAdditions: Math.round(totalAdditions * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netPayable: Math.round((totalAdditions - totalDeductions) * 100) / 100,
      },
    };
  }
}

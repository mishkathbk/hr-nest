import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CalculatePayrollDto } from "./dto/calculate-payroll.dto";
import { GetPayrollListDto } from "./dto/get-payroll-list.dto";
import { GeneratePayrollDto } from "./dto/generate-payroll.dto";

// Salary category codes (matches gen_lookup values)
const SALARY_CATEGORY_ADDITION = 4400001;
const SALARY_CATEGORY_DEDUCTION = 4400002;

// Salary type codes for OT and absent deductions
const SALARY_CODE_NOT = "NOT"; // Normal Overtime
const SALARY_CODE_HOT = "HOT"; // Holiday Overtime
const SALARY_CODE_ABSENT = "ABSENT"; // Absent/Unpaid leave deduction

@Injectable()
export class PayrollGenerationService {
  private readonly logger = new Logger(PayrollGenerationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Calculate Salary ────────────────────────────────────────────────────────
  // Mirrors SP_PayrollGeneration logic:
  //  1. Loop over active employees (or single employee)
  //  2. Skip if already approved
  //  3. Skip if no salary configured
  //  4. Delete existing draft, re-insert fresh payroll rows
  //  5. Insert salary components + OT + absent deductions
  //  6. Update totals on header

  async calculateSalary(
    dto: CalculatePayrollDto,
    companyId: number,
    currentId: number,
  ) {
    this.logger.log(
      `CalculateSalary started | year=${dto.year}, month=${dto.month}, companyId=${companyId}, employeeIds=${dto.employeeIds?.join(",") ?? "ALL"}`,
    );

    const startDate = new Date(Date.UTC(dto.year, dto.month - 1, 1));
    const endDate = new Date(Date.UTC(dto.year, dto.month, 0, 23, 59, 59, 999));

    // Fetch employees — active, filtered by company and optional employees
    const employees = await this.prisma.hrm_employee.findMany({
      where: {
        companyid: companyId,
        isactive: true,
        // statuscd: 300001,
        ...(dto.employeeIds && dto.employeeIds.length > 0 ? { employeeid: { in: dto.employeeIds } } : {}),
      },
      select: {
        employeeid: true,
        employeename: true,
        isot: true,
        holiday: true,
      },
    });

    if (employees.length === 0) {
      throw new NotFoundException("No active employees found for this filter");
    }

    // Fetch salary type IDs for OT + absent (once, reused for all employees)
    const specialSalaryTypes = await this.prisma.hrm_salarytype.findMany({
      where: {
        companyid: companyId,
        salarytypecode: {
          in: [SALARY_CODE_NOT, SALARY_CODE_HOT, SALARY_CODE_ABSENT],
        },
      },
      select: { salarytypeid: true, salarytypecode: true },
    });

    const salaryTypeMap = new Map(
      specialSalaryTypes.map((s) => [s.salarytypecode!, s.salarytypeid]),
    );

    const processed: number[] = [];
    const skipped: number[] = [];

    for (const emp of employees) {
      const empId = emp.employeeid;

      // ── Skip if already approved ────────────────────────────────────────────
      const existingApproved =
        await this.prisma.hrm_payrollgeneration.findFirst({
          where: {
            companyid: companyId,
            employeeid: empId,
            payrollyear: dto.year,
            payrollmonth: dto.month,
            isapprove: true,
          },
        });

      if (existingApproved) {
        this.logger.log(`Skip employee ${empId} — already approved`);
        skipped.push(empId);
        continue;
      }

      // ── Get latest salary on or before the payroll month ───────────────────
      const empSalary = await this.prisma.hrm_employeesalary.findFirst({
        where: {
          employeeid: empId,
          datefrom: { lte: startDate },
        },
        orderBy: { datefrom: "desc" },
        include: {
          hrm_employeesalarydet: {
            include: { hrm_salarytype: true },
          },
        },
      });

      const totalSalary = Number(empSalary?.totalsalary ?? 0);

      if (totalSalary === 0) {
        this.logger.log(`Skip employee ${empId} — no salary configured`);
        skipped.push(empId);
        continue;
      }

      // ── Salary rate calculations (mirrors SP formula) ───────────────────────
      const daySalary = Math.round((totalSalary / 30) * 100) / 100;
      const notRate = Math.round((totalSalary / 30 / 8) * 1.25 * 100) / 100;
      const hotRate = Math.round((totalSalary / 30 / 8) * 1.5 * 100) / 100;

      // ── Delete existing draft if any ────────────────────────────────────────
      const existing = await this.prisma.hrm_payrollgeneration.findFirst({
        where: {
          companyid: companyId,
          employeeid: empId,
          payrollyear: dto.year,
          payrollmonth: dto.month,
        },
      });

      if (existing) {
        await this.prisma.hrm_payrollgenerationdet.deleteMany({
          where: { payrollgenerationid: existing.payrollgenerationid },
        });
        await this.prisma.hrm_payrollgeneration.delete({
          where: { payrollgenerationid: existing.payrollgenerationid },
        });
      }

      // ── Insert payroll header ───────────────────────────────────────────────
      const payrollHeader = await this.prisma.hrm_payrollgeneration.create({
        data: {
          employeeid: empId,
          payrollyear: dto.year,
          payrollmonth: dto.month,
          isapprove: false,
          companyid: companyId,
          isactive: true,
          createdby: currentId,
          createddate: new Date(),
          isdeleted: false,
        },
      });

      const pgId = payrollHeader.payrollgenerationid;
      const detRows: any[] = [];

      // ── Insert salary components from hrm_employeesalarydet ─────────────────
      if (empSalary?.hrm_employeesalarydet) {
        for (const det of empSalary.hrm_employeesalarydet) {
          const amount = Number(det.amount ?? 0);
          if (amount <= 0) continue;

          const categoryCode = det.hrm_salarytype?.salarytypecategorycd;
          detRows.push({
            payrollgenerationid: pgId,
            salarytypeid: det.salarytypeid,
            addamount: categoryCode === SALARY_CATEGORY_ADDITION ? amount : 0,
            dedamount: categoryCode === SALARY_CATEGORY_DEDUCTION ? amount : 0,
            companyid: companyId,
            isactive: true,
            isdeleted: false,
            createdby: currentId,
            createddate: new Date(),
          });
        }
      }

      // ── Salary Adjustment Posting ─────────────────────────────────────────────
      const salaryAdjustments = await this.prisma.hrm_salaryadjustment.findMany(
        {
          where: {
            employeeid: empId,
            companyid: companyId,
            payrollyear: dto.year,
            payrollmonth: dto.month,
            isdeleted: { not: true },
          },
          include: {
            hrm_salarytype: {
              select: { salarytypecategorycd: true },
            },
          },
        },
      );

      for (const adj of salaryAdjustments) {
        const amount = Number(adj.amount ?? 0);
        if (amount <= 0) continue;

        const categoryCode = adj.hrm_salarytype?.salarytypecategorycd;
        detRows.push({
          payrollgenerationid: pgId,
          salarytypeid: adj.salarytypeid,
          addamount: categoryCode === SALARY_CATEGORY_ADDITION ? amount : 0,
          dedamount: categoryCode === SALARY_CATEGORY_DEDUCTION ? amount : 0,
          notes1: adj.remarks ?? null,
          companyid: companyId,
          isactive: true,
          isdeleted: false,
          createdby: currentId,
          createddate: new Date(),
        });
      }

      // ── Get attendance summary for the month ────────────────────────────────
      const attendanceSummary = await this.getAttendanceSummary(
        empId,
        companyId,
        startDate,
        endDate,
        emp.holiday,
      );

      // ── OT calculation (if employee is OT-eligible) ─────────────────────────
      if (emp.isot) {
        const notTypeId = salaryTypeMap.get(SALARY_CODE_NOT);
        const hotTypeId = salaryTypeMap.get(SALARY_CODE_HOT);

        if (attendanceSummary.normalOTHours > 0 && notTypeId) {
          const notAmount =
            Math.round(attendanceSummary.normalOTHours * notRate * 100) / 100;
          detRows.push({
            payrollgenerationid: pgId,
            salarytypeid: notTypeId,
            addamount: notAmount,
            dedamount: 0,
            notes1: `Total NOT Hours: ${attendanceSummary.normalOTHours}`,
            companyid: companyId,
            isactive: true,
            isdeleted: false,
            createdby: currentId,
            createddate: new Date(),
          });
        }

        if (attendanceSummary.holidayOTHours > 0 && hotTypeId) {
          const hotAmount =
            Math.round(attendanceSummary.holidayOTHours * hotRate * 100) / 100;
          detRows.push({
            payrollgenerationid: pgId,
            salarytypeid: hotTypeId,
            addamount: hotAmount,
            dedamount: 0,
            notes1: `Total HOT Hours: ${attendanceSummary.holidayOTHours}`,
            companyid: companyId,
            isactive: true,
            isdeleted: false,
            createdby: currentId,
            createddate: new Date(),
          });
        }
      }

      // ── Absent / Unpaid leave deduction ─────────────────────────────────────
      const absentTypeId = salaryTypeMap.get(SALARY_CODE_ABSENT);
      const totalAbsent =
        attendanceSummary.absentDays + attendanceSummary.unpaidLeaveDays;

      if (totalAbsent > 0 && absentTypeId) {
        const absentDeduction = Math.round(totalAbsent * daySalary * 100) / 100;
        detRows.push({
          payrollgenerationid: pgId,
          salarytypeid: absentTypeId,
          addamount: 0,
          dedamount: absentDeduction,
          notes1: `Total Absent: ${totalAbsent}`,
          companyid: companyId,
          isactive: true,
          isdeleted: false,
          createdby: currentId,
          createddate: new Date(),
        });
      }

      // ── Bulk insert all det rows ─────────────────────────────────────────────
      if (detRows.length > 0) {
        await this.prisma.hrm_payrollgenerationdet.createMany({
          data: detRows,
        });
      }

      // ── Update header totals ─────────────────────────────────────────────────
      const allDet = await this.prisma.hrm_payrollgenerationdet.findMany({
        where: { payrollgenerationid: pgId, isdeleted: { not: true } },
      });

      const totalAmount = allDet.reduce(
        (sum, d) => sum + Number(d.addamount ?? 0) - Number(d.dedamount ?? 0),
        0,
      );

      await this.prisma.hrm_payrollgeneration.update({
        where: { payrollgenerationid: pgId },
        data: {
          totalamount: Math.round(totalAmount * 10000) / 10000,
          totalhours: attendanceSummary.totalHours,
          totaldays: attendanceSummary.presentDays,
          modifiedby: currentId,
          modifieddate: new Date(),
        },
      });

      processed.push(empId);
      this.logger.log(
        `Processed employee ${empId} | pgId=${pgId}, totalAmount=${totalAmount}`,
      );
    }

    this.logger.log(
      `CalculateSalary completed | processed=${processed.length}, skipped=${skipped.length}`,
    );

    return {
      processed: processed.length,
      skipped: skipped.length,
      processedEmployeeIds: processed,
      skippedEmployeeIds: skipped,
    };
  }

  // ─── Get Payroll List ─────────────────────────────────────────────────────────
  // Returns the grid summary: employee name, additions, deductions, net total

  async getPayrollList(dto: GetPayrollListDto, companyId: number) {
    this.logger.log(
      `GetPayrollList started | year=${dto.year}, month=${dto.month}, companyId=${companyId}`,
    );

    const where: any = {
      companyid: companyId,
      payrollyear: dto.year,
      payrollmonth: dto.month,
      isdeleted: false,
    };

    if (dto.employeeId) where.employeeid = dto.employeeId;

    const records = await this.prisma.hrm_payrollgeneration.findMany({
      where,
      include: {
        hrm_payrollgenerationdet: {
          where: { isdeleted: false },
        },
      },
      orderBy: { payrollgenerationid: "asc" },
    });

    // Fetch employee details for the found records
    const employeeIds = records.map((r) => r.employeeid);
    const employees = await this.prisma.hrm_employee.findMany({
      where: { employeeid: { in: employeeIds } },
      select: {
        employeeid: true,
        employeename: true,
        employeecode: true,
        hrm_department: { select: { departmentname: true } },
        hrm_designation: { select: { designationname: true } },
      },
    });

    const empMap = new Map(employees.map((e) => [e.employeeid, e]));

    let totalAdditions = 0;
    let totalDeductions = 0;

    const rows = records.map((r) => {
      const emp = empMap.get(r.employeeid);
      const additions = r.hrm_payrollgenerationdet.reduce(
        (sum, d) => sum + Number(d.addamount ?? 0),
        0,
      );
      const deductions = r.hrm_payrollgenerationdet.reduce(
        (sum, d) => sum + Number(d.dedamount ?? 0),
        0,
      );
      const netAmount = additions - deductions;

      totalAdditions += additions;
      totalDeductions += deductions;

      return {
        payrollgenerationid: r.payrollgenerationid,
        employeeid: r.employeeid,
        employeecode: emp?.employeecode ?? null,
        employeename: emp?.employeename ?? null,
        departmentname: emp?.hrm_department?.departmentname ?? null,
        designationname: emp?.hrm_designation?.designationname ?? null,
        payrollyear: r.payrollyear,
        payrollmonth: r.payrollmonth,
        additions: Math.round(additions * 100) / 100,
        deductions: Math.round(deductions * 100) / 100,
        totalamount: Math.round(netAmount * 100) / 100,
        totaldays: r.totaldays ? Number(r.totaldays) : null,
        totalhours: r.totalhours ? Number(r.totalhours) : null,
        isapprove: r.isapprove,
        approvedby: r.approvedby,
        approveddate: r.approveddate,
      };
    });

    this.logger.log(`GetPayrollList completed | records=${rows.length}`);

    return {
      year: dto.year,
      month: dto.month,
      rows,
      summary: {
        totalEmployees: rows.length,
        totalAdditions: Math.round(totalAdditions * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        totalPayable:
          Math.round((totalAdditions - totalDeductions) * 100) / 100,
      },
    };
  }

  // ─── Generate (Approve) Payroll ───────────────────────────────────────────────
  // Marks selected payroll records as approved

  async generatePayroll(
    dto: GeneratePayrollDto,
    companyId: number,
    currentId: number,
  ) {
    this.logger.log(
      `GeneratePayroll started | ids=${dto.payrollGenerationIds.join(",")}, companyId=${companyId}`,
    );

    // Verify all records exist and belong to this company
    const records = await this.prisma.hrm_payrollgeneration.findMany({
      where: {
        payrollgenerationid: { in: dto.payrollGenerationIds },
        companyid: companyId,
      },
    });

    if (records.length !== dto.payrollGenerationIds.length) {
      throw new BadRequestException(
        "One or more payroll records not found or do not belong to your company",
      );
    }

    const alreadyApproved = records.filter((r) => r.isapprove);
    if (alreadyApproved.length > 0) {
      throw new BadRequestException(
        `Records already approved: ${alreadyApproved.map((r) => r.payrollgenerationid).join(", ")}`,
      );
    }

    // Bulk approve
    const result = await this.prisma.hrm_payrollgeneration.updateMany({
      where: {
        payrollgenerationid: { in: dto.payrollGenerationIds },
        companyid: companyId,
        isapprove: false,
      },
      data: {
        isapprove: true,
        approvedby: currentId,
        approveddate: new Date(),
        modifiedby: currentId,
        modifieddate: new Date(),
      },
    });

    this.logger.log(`GeneratePayroll completed | approved=${result.count}`);

    return {
      approved: result.count,
      payrollGenerationIds: dto.payrollGenerationIds,
    };
  }

  // ─── Get Payroll Detail ───────────────────────────────────────────────────────
  // Returns line-by-line salary breakdown for a single employee payroll record

  async getPayrollDetail(payrollGenerationId: number, companyId: number) {
    this.logger.log(
      `GetPayrollDetail started | payrollGenerationId=${payrollGenerationId}`,
    );

    const header = await this.prisma.hrm_payrollgeneration.findFirst({
      where: {
        payrollgenerationid: payrollGenerationId,
        companyid: companyId,
      },
    });

    if (!header) throw new NotFoundException("Payroll record not found");

    const det = await this.prisma.hrm_payrollgenerationdet.findMany({
      where: {
        payrollgenerationid: payrollGenerationId,
        isdeleted: false,
      },
      orderBy: { payrollgenerationdetid: "asc" },
    });

    // Fetch salary type names for all det rows
    const salaryTypeIds = [...new Set(det.map((d) => d.salarytypeid))];
    const salaryTypes = await this.prisma.hrm_salarytype.findMany({
      where: { salarytypeid: { in: salaryTypeIds } },
      select: {
        salarytypeid: true,
        salarytypecode: true,
        salarytypename: true,
        salarytypecategorycd: true,
      },
    });
    const stMap = new Map(salaryTypes.map((s) => [s.salarytypeid, s]));

    // Fetch employee info
    const emp = await this.prisma.hrm_employee.findUnique({
      where: { employeeid: header.employeeid },
      select: {
        employeeid: true,
        employeecode: true,
        employeename: true,
        hrm_department: { select: { departmentname: true } },
        hrm_designation: { select: { designationname: true } },
      },
    });

    const additions = det
      .filter((d) => Number(d.addamount ?? 0) > 0)
      .map((d) => ({
        payrollgenerationdetid: d.payrollgenerationdetid,
        salarytypeid: d.salarytypeid,
        salarytypecode: stMap.get(d.salarytypeid)?.salarytypecode ?? null,
        salarytypename: stMap.get(d.salarytypeid)?.salarytypename ?? null,
        amount: Number(d.addamount ?? 0),
        notes: d.notes1,
      }));

    const deductions = det
      .filter((d) => Number(d.dedamount ?? 0) > 0)
      .map((d) => ({
        payrollgenerationdetid: d.payrollgenerationdetid,
        salarytypeid: d.salarytypeid,
        salarytypecode: stMap.get(d.salarytypeid)?.salarytypecode ?? null,
        salarytypename: stMap.get(d.salarytypeid)?.salarytypename ?? null,
        amount: Number(d.dedamount ?? 0),
        notes: d.notes1,
      }));

    const totalAdditions = additions.reduce((s, d) => s + d.amount, 0);
    const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);

    this.logger.log(
      `GetPayrollDetail completed | payrollGenerationId=${payrollGenerationId}`,
    );

    return {
      payrollgenerationid: header.payrollgenerationid,
      employee: emp,
      payrollyear: header.payrollyear,
      payrollmonth: header.payrollmonth,
      totaldays: header.totaldays ? Number(header.totaldays) : null,
      totalhours: header.totalhours ? Number(header.totalhours) : null,
      totalamount: header.totalamount ? Number(header.totalamount) : null,
      isapprove: header.isapprove,
      approvedby: header.approvedby,
      approveddate: header.approveddate,
      additions,
      deductions,
      summary: {
        totalAdditions: Math.round(totalAdditions * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netPayable: Math.round((totalAdditions - totalDeductions) * 100) / 100,
      },
    };
  }

  // ─── Private: Attendance Summary ──────────────────────────────────────────────
  // Mirrors SP_AttendanceDetail logic — computes present days, absent days, hours
  // for a given employee and month by querying hrm_attendance records

  private async getAttendanceSummary(
    employeeId: number,
    companyId: number,
    startDate: Date,
    endDate: Date,
    holidayStr: string | null,
  ): Promise<{
    presentDays: number;
    absentDays: number;
    unpaidLeaveDays: number;
    totalHours: number;
    normalOTHours: number;
    holidayOTHours: number;
  }> {
    // Build weekend set from employee.holiday (e.g. "Saturday,Sunday")
    const weekendDays = new Set(
      (holidayStr ?? "Saturday,Sunday")
        .split(",")
        .map((d) => d.trim().toLowerCase()),
    );

    const daysInMonth = endDate.getUTCDate();
    let presentDays = 0;
    let absentDays = 0;
    const unpaidLeaveDays = 0;
    let totalHours = 0;
    // OT fields are 0 until a dedicated OT tracking table is available
    const normalOTHours = 0;
    const holidayOTHours = 0;

    // Fetch all attendance records for this employee in the month
    const attendanceRecords = await this.prisma.hrm_attendance.findMany({
      where: {
        employeeid: employeeId,
        companyid: companyId,
        isdeleted: false,
        attendancedate: { gte: startDate, lte: endDate },
      },
      select: {
        attendancedate: true,
        totalhour: true,
      },
    });

    // Map: dayOfMonth → totalHours
    const attendanceDayMap = new Map<number, number>();
    for (const rec of attendanceRecords) {
      const day = new Date(rec.attendancedate!).getUTCDate();
      attendanceDayMap.set(day, Number(rec.totalhour ?? 0));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), d),
      );
      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
        .toLowerCase();

      if (weekendDays.has(dayName)) continue; // Weekend — not counted

      if (attendanceDayMap.has(d)) {
        presentDays++;
        totalHours += attendanceDayMap.get(d)!;
      } else {
        absentDays++;
      }
    }

    return {
      presentDays,
      absentDays,
      unpaidLeaveDays,
      totalHours: Math.round(totalHours * 100) / 100,
      normalOTHours,
      holidayOTHours,
    };
  }
}

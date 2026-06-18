import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { validateUniqueCode } from "../common/validators/unique-code.validator";
import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateSalaryAdvanceReqDto } from "./dto/create-salary-advance-req.dto";
import { UpdateSalaryAdvanceReqDto } from "./dto/update-salary-advance-req.dto";
import { PaginationSalaryAdvanceReqDto } from "./dto/pagination-salary-advance-req.dto";
import { STATUS_ACTIVE } from "../common/constants/status.constants";

@Injectable()

// private async getAdvanceSummary(employeeId: number, companyId: number) {
//   const advances = await this.prisma.hrm_salary_advance_req.findMany({
//     where: {
//       isdeleted: false,
//       companyid: companyId,
//       // employeeid: employeeId,   // adjust field name to match your schema
//     },
//     orderBy: { createddate: 'desc' },
//   });

//   const advanceCount = advances.length;
//   const totalAdvanceTaken = advances.reduce(
//     (sum, r) => sum + (Number(r.salaryadvanceamountreq) || 0), 0
//   );
//   const lastAdvanceDate = advances.length > 0 ? advances[0].createddate : null;

//   return { advanceCount, totalAdvanceTaken, lastAdvanceDate };
// }
export class SalaryAdvanceReqService {
  private readonly logger = new Logger(SalaryAdvanceReqService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── GetByKey ────────────────────────────────────────────────────────────────

  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_salary_advance_req.findUnique({
      where: { salaryadvancereqid: id },
    });

    if (!record) throw new NotFoundException("Record not found");

    this.logger.log(`GetByKey completed | id=${id}`);
    return record;
  }

  // ─── SaveData ────────────────────────────────────────────────────────────────

  async saveData(
    dto: CreateSalaryAdvanceReqDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );
    if (dto.employeeid && dto.grosssalary && dto.salaryadvanceamountreq) {
      await this.validateAdvanceEligibility(
        dto.employeeid,
        companyId,
        dto.grosssalary,
        dto.salaryadvanceamountreq,
      );
    }
    await validateUniqueCode(
      this.prisma,
      "hrm_salary_advance_req",
      companyId,
      "reqno",
      dto.reqno,
    );

    const record = await this.prisma.hrm_salary_advance_req.create({
      data: {
        reqno: dto.reqno,
        employeeid: dto.employeeid,
        reqforcd: dto.reqforcd ?? null,
        reason: dto.reason ?? null,
        grosssalary: dto.grosssalary ?? null,
        salaryadvanceamountreq: dto.salaryadvanceamountreq ?? null,
        approvedamount: dto.approvedamount ?? null,
        noofdeductions: dto.noofdeductions ?? null,
        amountdeductiblepermonth: dto.amountdeductiblepermonth ?? null,
        deductionstartdate: dto.deductionstartdate ? new Date(dto.deductionstartdate) : null,
        approvedby: dto.approvedby ?? null,
        approveddate: dto.approveddate ? new Date(dto.approveddate) : null,
        statuscd: dto.statuscd ?? STATUS_ACTIVE,
        isactive: dto.isactive ?? true,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
      },
    });

    this.logger.log(`SaveData completed | id=${record.salaryadvancereqid}`);
    return record;
  }

  // ─── UpdateData ──────────────────────────────────────────────────────────────

  async updateData(
    id: number,
    dto: UpdateSalaryAdvanceReqDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    let employeeIdForValidation = dto.employeeid;
    if ((dto.grosssalary || dto.salaryadvanceamountreq) && !employeeIdForValidation) {
       const existing = await this.prisma.hrm_salary_advance_req.findUnique({ where: { salaryadvancereqid: id } });
       if (existing) employeeIdForValidation = existing.employeeid;
    }

    if (employeeIdForValidation && dto.grosssalary && dto.salaryadvanceamountreq) {
      await this.validateAdvanceEligibility(
        employeeIdForValidation,
        companyId,
        dto.grosssalary,
        dto.salaryadvanceamountreq,
        id, // excludes the current record from history check
      );
    }

    if (dto.reqno) {
      await validateUniqueCode(
        this.prisma,
        "hrm_salary_advance_req",
        companyId,
        "reqno",
        dto.reqno,
        "salaryadvancereqid",
        id,
      );
    }

    const updated = await this.prisma.hrm_salary_advance_req.update({
      where: { salaryadvancereqid: id },
      data: {
        reqno: dto.reqno,
        employeeid: dto.employeeid,
        reqforcd: dto.reqforcd,
        reason: dto.reason,
        grosssalary: dto.grosssalary,
        salaryadvanceamountreq: dto.salaryadvanceamountreq,
        approvedamount: dto.approvedamount,
        noofdeductions: dto.noofdeductions,
        amountdeductiblepermonth: dto.amountdeductiblepermonth,
        deductionstartdate: dto.deductionstartdate ? new Date(dto.deductionstartdate) : undefined,
        approvedby: dto.approvedby,
        approveddate: dto.approveddate ? new Date(dto.approveddate) : undefined,
        statuscd: dto.statuscd,
        isactive: dto.isactive,
        modifiedby: currentId,
        modifieddate: new Date(),
      },
    });

    if (!updated)
      throw new NotFoundException("Update failed or record not found");

    this.logger.log(`UpdateData completed | id=${id}`);
    return updated;
  }

  // ─── DeleteData ──────────────────────────────────────────────────────────────

  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_salary_advance_req.update({
      where: { salaryadvancereqid: id },
      data: {
        isdeleted: true,
        deleteby: currentId,
        deletedate: new Date(),
      },
    });

    if (!updated) throw new NotFoundException("Record not found");

    this.logger.log(`DeleteData completed | id=${id}`);
    return { deleted: true };
  }

  // ─── List ────────────────────────────────────────────────────────────────────

  async list(companyId: number, isInactiveLoad = false) {
    this.logger.log(
      `List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`,
    );

    const where: any = {
      isdeleted: false,
      companyid: companyId,
    };

    if (!isInactiveLoad) {
      where.statuscd = STATUS_ACTIVE;
    }

    const records = await this.prisma.hrm_salary_advance_req.findMany({
      where,
      orderBy: { createddate: "desc" },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  // ─── ListPagination ──────────────────────────────────────────────────────────

  async listPagination(
    dto: PaginationSalaryAdvanceReqDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const {
      search = "",
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = "salaryadvancereqid",
      isDescending = true,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search?.trim()) {
      where.OR = [
        { reqno: { contains: search } },
        // { reason: { contains: search } },
      ];
    }

    if (filters?.length > 0) {
      for (const item of filters) {
        const fieldName = item.attributeName;
        const rawValue = item.attributeValue;
        if (rawValue === "true" || rawValue === "false") {
          where[fieldName] = rawValue === "true";
        } else if (!isNaN(Number(rawValue)) && rawValue.trim() !== "") {
          where[fieldName] = Number(rawValue);
        } else if (!isNaN(Date.parse(rawValue))) {
          where[fieldName] = new Date(rawValue);
        } else {
          where[fieldName] = { contains: rawValue };
        }
      }
    }

    const orderBy: any = { [sortBy]: isDescending ? "desc" : "asc" };

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_salary_advance_req.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.hrm_salary_advance_req.count({ where }),
    ]);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(records, totalCount);
  }

  private async validateAdvanceEligibility(
    employeeId: number,
    companyId: number,
    grossSalary: number,
    requestedAmount: number,
    excludeReqId?: number, // pass this on update to exclude current record
  ) {
    // ── Rule 1 & 2: fetch history ──────────────────────────────────
    let advances = await this.prisma.hrm_salary_advance_req.findMany({
      where: {
        isdeleted: false,
        companyid: companyId,
        employeeid: employeeId,
        ...(excludeReqId ? { NOT: { salaryadvancereqid: excludeReqId } } : {}),
      },
      orderBy: { createddate: "desc" },
    });

    const advanceCount = advances.length;
    const lastAdvanceDate =
      advances.length > 0 ? new Date(advances[0].createddate) : null;

    // ── Rule 1: Max 3 advances ─────────────────────────────────────
    if (advanceCount >= 3) {
      throw new BadRequestException(
        "You have already availed the maximum of three salary advances.",
      );
    }

    // ── Rule 2: 6-month cooldown ───────────────────────────────────
    if (lastAdvanceDate) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (lastAdvanceDate >= sixMonthsAgo) {
        throw new BadRequestException(
          "Only one salary advance can be granted within a six-month period.",
        );
      }
    }

    // ── Rule 3: Per-request amount cap (60% × 3 of gross) ─────────
    const maxAllowed = grossSalary * 0.6 * 3;

    if (requestedAmount > maxAllowed) {
      throw new BadRequestException(
        `Requested amount exceeds the maximum allowed (${maxAllowed.toFixed(2)}).`,
      );
    }

    if (requestedAmount <= 0) {
      throw new BadRequestException(
        "Advance amount must be greater than zero.",
      );
    }
  }
}

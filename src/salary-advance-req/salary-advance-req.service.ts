import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
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
      where: { reqid: id },
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
    if (dto.grossSalary && dto.salaryAdvanceAmountReq) {
      await this.validateAdvanceEligibility(
        // dto.employeeId,
        companyId,
        dto.grossSalary,
        dto.salaryAdvanceAmountReq,
      );
    }
    await validateUniqueCode(
      this.prisma,
      "hrm_salary_advance_req",
      companyId,
      "reqno",
      dto.reqNo,
    );

    const record = await this.prisma.hrm_salary_advance_req.create({
      data: {
        reqno: dto.reqNo,
        requestingfor: dto.requestingFor ?? null,
        reason: dto.reason ?? null,
        grosssalary: dto.grossSalary ?? null,
        salaryadvanceamountreq: dto.salaryAdvanceAmountReq ?? null,
        statuscd: dto.statusCd ?? STATUS_ACTIVE,
        isactive: dto.isActive ?? true,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
      },
    });

    this.logger.log(`SaveData completed | reqid=${record.reqid}`);
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

    if (dto.grossSalary && dto.salaryAdvanceAmountReq) {
      await this.validateAdvanceEligibility(
        // dto.employeeId,
        companyId,
        dto.grossSalary,
        dto.salaryAdvanceAmountReq,
        id, // excludes the current record from history check
      );
    }

    if (dto.reqNo) {
      await validateUniqueCode(
        this.prisma,
        "hrm_salary_advance_req",
        companyId,
        "reqno",
        dto.reqNo,
        "reqid",
        id,
      );
    }

    const updated = await this.prisma.hrm_salary_advance_req.update({
      where: { reqid: id },
      data: {
        reqno: dto.reqNo,
        requestingfor: dto.requestingFor ?? null,
        reason: dto.reason ?? null,
        grosssalary: dto.grossSalary ?? null,
        salaryadvanceamountreq: dto.salaryAdvanceAmountReq ?? null,
        statuscd: dto.statusCd ?? undefined,
        isactive: dto.isActive ?? undefined,
        companyid: companyId,
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
      where: { reqid: id },
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
    const { search = "", filterList = [], offset = 0, limit = 10 } = dto;
    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, offset=${offset}, limit=${limit}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search) {
      where.AND = [
        {
          OR: [
            { reqno: { contains: search } },
            { requestingfor: { contains: search } },
            { reason: { contains: search } },
          ],
        },
      ];
    }

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_salary_advance_req.findMany({
        where,
        orderBy: { createddate: "desc" },
        skip: offset,
        take: limit,
      }),
      this.prisma.hrm_salary_advance_req.count({ where }),
    ]);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(records, totalCount);
  }

  // ─── ListSearch ──────────────────────────────────────────────────────────────

  async listSearch(search: string, companyId: number) {
    this.logger.log(
      `ListSearch started | companyId=${companyId}, search=${search}`,
    );

    const where: any = {
      isdeleted: false,
      statuscd: STATUS_ACTIVE,
      companyid: companyId,
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { reqno: { contains: search } },
            { requestingfor: { contains: search } },
            { reason: { contains: search } },
          ],
        },
      ];
    }

    const records = await this.prisma.hrm_salary_advance_req.findMany({
      where,
    });
    this.logger.log(`ListSearch completed | count=${records.length}`);
    return records;
  }

  private async validateAdvanceEligibility(
    // employeeId: number,
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
        // employeeid: employeeId,
        ...(excludeReqId ? { NOT: { reqid: excludeReqId } } : {}),
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

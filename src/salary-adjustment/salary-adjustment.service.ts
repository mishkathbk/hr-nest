import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateSalaryAdjustmentDto } from "./dto/create-salary-adjustment.dto";
import { UpdateSalaryAdjustmentDto } from "./dto/update-salary-adjustment.dto";
import { PaginationSalaryAdjustmentDto } from "./dto/pagination-salary-adjustment.dto";
import { STATUS_ACTIVE } from "../common/constants/status.constants";

@Injectable()
export class SalaryAdjustmentService {
  private readonly logger = new Logger(SalaryAdjustmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── GET /api/salary-adjustment/:id
  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_salaryadjustment.findUnique({
      where: { salaryadjustmentid: id },
    });

    if (!record) throw new NotFoundException("Record not found");

    this.logger.log(`GetByKey completed | id=${id}`);
    return record;
  }

  // ── POST /api/salary-adjustment ─────────────────────────────────────────────
  async saveData(
    dto: CreateSalaryAdjustmentDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );

    const record = await this.prisma.hrm_salaryadjustment.create({
      data: {
        employeeid: dto.EmployeeId ?? 0,
        salarytypeid: dto.SalaryTypeId ?? 0,
        payrollyear: dto.PayrollYear ?? new Date().getFullYear(),
        payrollmonth: dto.PayrollMonth ?? new Date().getMonth() + 1,
        amount: dto.Amount ?? null,
        remarks: dto.Remarks ?? null,
        statuscd: dto.StatusCd ?? STATUS_ACTIVE,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
        isactive: true,
      },
    });

    this.logger.log(`SaveData completed | salaryadjustmentid=${record.salaryadjustmentid}`);
    return record;
  }

  // ── PUT /api/salary-adjustment/:id ──────────────────────────────────────────
  async updateData(
    id: number,
    dto: UpdateSalaryAdjustmentDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_salaryadjustment.update({
      where: { salaryadjustmentid: id },
      data: {
        employeeid: dto.EmployeeId,
        salarytypeid: dto.SalaryTypeId,
        payrollyear: dto.PayrollYear,
        payrollmonth: dto.PayrollMonth,
        amount: dto.Amount,
        remarks: dto.Remarks,
        statuscd: dto.StatusCd,
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

  // ── DELETE /api/salary-adjustment/:id ───────────────────────────────────────
  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_salaryadjustment.update({
      where: { salaryadjustmentid: id },
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

  // ── GET /api/salary-adjustment ──────────────────────────────────────────────
  async list(companyId: number, isInactiveLoad = false) {
    this.logger.log(
      `List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`,
    );

    const records = await this.prisma.hrm_salaryadjustment.findMany({
      where: {
        isdeleted: false,
        statuscd: STATUS_ACTIVE,
        companyid: companyId,
        ...(isInactiveLoad ? {} : { isactive: true }),
      },
      orderBy: { createddate: "desc" },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  // ── POST /api/salary-adjustment/list/pagination ──────────────────────────────────────────────────────────
  async listPagination(
    dto: PaginationSalaryAdjustmentDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const {
      search = "",
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = "salaryadjustmentid",
      isDescending = true,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search?.trim()) {
      where.OR = [
        { remarks: { contains: search } },
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
      this.prisma.hrm_salaryadjustment.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.hrm_salaryadjustment.count({ where }),
    ]);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(records, totalCount);
  }
}

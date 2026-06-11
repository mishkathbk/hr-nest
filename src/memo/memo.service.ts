import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { validateUniqueCode } from "../common/validators/unique-code.validator";
import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateMemoDto } from "./dto/create-memo.dto";
import { UpdateMemoDto } from "./dto/update-memo.dto";
import { PaginationMemoDto } from "./dto/pagination-memo.dto";
import { STATUS_ACTIVE } from "../common/constants/status.constants";

@Injectable()
export class MemoService {
  private readonly logger = new Logger(MemoService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── GetByKey ────────────────────────────────────────────────────────────────

  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_memo.findUnique({
      where: { memoid: id },
    });

    if (!record) throw new NotFoundException("Record not found");

    const withEmployee = await this.attachEmployeeNames([record]);

    this.logger.log(`GetByKey completed | id=${id}`);
    return withEmployee[0];
  }

  // ─── SaveData ────────────────────────────────────────────────────────────────

  async saveData(dto: CreateMemoDto, currentId: number, companyId: number) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );

    await validateUniqueCode(
      this.prisma,
      "hrm_memo",
      companyId,
      "memocode",
      dto.memoCode,
    );

    const record = await this.prisma.hrm_memo.create({
      data: {
        memocode: dto.memoCode,
        memotypecd: dto.memoTypeCd ?? null,
        memosubject: dto.memoSubject ?? null,
        memotext: dto.memoText ?? null,
        documentgroupid: dto.documentGroupId ?? null,
        statuscd: dto.statusCd ?? STATUS_ACTIVE,
        isactive: dto.isActive ?? true,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
      },
    });

    if (dto.employeeIds && dto.employeeIds.length > 0) {
      const mappings = dto.employeeIds.map((empId) => ({
        memoid: record.memoid,
        employeeid: empId,
      }));
      await this.prisma.hrm_memo_employee.createMany({ data: mappings });
    }

    this.logger.log(`SaveData completed | memoid=${record.memoid}`);
    return record;
  }

  // ─── UpdateData ──────────────────────────────────────────────────────────────

  async updateData(
    id: number,
    dto: UpdateMemoDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    if (dto.memoCode) {
      await validateUniqueCode(
        this.prisma,
        "hrm_memo",
        companyId,
        "memocode",
        dto.memoCode,
        "memoid",
        id,
      );
    }

    const updated = await this.prisma.hrm_memo.update({
      where: { memoid: id },
      data: {
        memocode: dto.memoCode ?? undefined,
        memotypecd: dto.memoTypeCd ?? undefined,
        memosubject: dto.memoSubject ?? undefined,
        memotext: dto.memoText ?? undefined,
        documentgroupid: dto.documentGroupId ?? undefined,
        statuscd: dto.statusCd ?? undefined,
        isactive: dto.isActive ?? undefined,
        companyid: companyId,
        modifiedby: currentId,
        modifieddate: new Date(),
      },
    });

    if (!updated)
      throw new NotFoundException("Update failed or record not found");

    if (dto.employeeIds) {
      await this.prisma.hrm_memo_employee.deleteMany({ where: { memoid: id } });
      if (dto.employeeIds.length > 0) {
        const mappings = dto.employeeIds.map((empId) => ({
          memoid: id,
          employeeid: empId,
        }));
        await this.prisma.hrm_memo_employee.createMany({ data: mappings });
      }
    }

    this.logger.log(`UpdateData completed | id=${id}`);
    return updated;
  }

  // ─── DeleteData ──────────────────────────────────────────────────────────────

  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_memo.update({
      where: { memoid: id },
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

    const records = await this.prisma.hrm_memo.findMany({
      where,
      orderBy: { createddate: "desc" },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return await this.attachEmployeeNames(records);
  }

  // ─── ListPagination ──────────────────────────────────────────────────────────

  async listPagination(
    dto: PaginationMemoDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const {
      search = "",
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = "memoid",
      isDescending = true,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search?.trim()) {
      where.OR = [
        { memocode: { contains: search } },
        { memosubject: { contains: search } },
        { memotext: { contains: search } },
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
      this.prisma.hrm_memo.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.hrm_memo.count({ where }),
    ]);

    const recordsWithEmployeeNames = await this.attachEmployeeNames(records);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(recordsWithEmployeeNames, totalCount);
  }

  // ─── Attach Employee Names Helper ────────────────────────────────────────────

  private async attachEmployeeNames(records: any[]) {
    if (!records || records.length === 0) return records;

    const memoIds = records.map((r) => r.memoid);

    const mappings = await this.prisma.hrm_memo_employee.findMany({
      where: { memoid: { in: memoIds } },
    });

    if (!mappings || mappings.length === 0) {
      return records.map((r) => ({ ...r, employees: [] }));
    }

    const employeeIds = [...new Set(mappings.map((m) => m.employeeid))];

    const employees = await this.prisma.hrm_employee.findMany({
      where: { employeeid: { in: employeeIds } },
      select: { employeeid: true, employeename: true },
    });
    // console.log("employees::", employees);
    const employeeMap = new Map(
      employees.map((e) => [e.employeeid, e.employeename]),
    );

    return records.map((r) => {
      const relatedMappings = mappings.filter((m) => m.memoid === r.memoid);
      const employeesData = relatedMappings.map((m) => ({
        employeeid: m.employeeid,
        employeename: employeeMap.get(m.employeeid) || null,
      }));
      return {
        ...r,
        employees: employeesData,
      };
    });
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { validateUniqueCode } from "../common/validators/unique-code.validator";

import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateSalaryTypeDto } from "./dto/create-salary-type.dto";
import { UpdateSalaryTypeDto } from "./dto/update-salary-type.dto";
import { PaginationSalaryTypeDto } from "./dto/pagination-salary-type.dto";
import { STATUS_ACTIVE } from "../common/constants/status.constants";

@Injectable()
export class SalaryTypeService {
  private readonly logger = new Logger(SalaryTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── GET /api/salary-type/:id
  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_salarytype.findUnique({
      where: { salarytypeid: id },
    });

    if (!record) throw new NotFoundException("Record not found");

    this.logger.log(`GetByKey completed | id=${id}`);
    return record;
  }

  // ── POST /api/salary-type ─────────────────────────────────────────────
  async saveData(
    dto: CreateSalaryTypeDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );

    await validateUniqueCode(
      this.prisma,
      "hrm_salarytype",
      companyId,
      "salarytypecode",
      dto.SalaryTypeCode,
    );

    const record = await this.prisma.hrm_salarytype.create({
      data: {
        salarytypecode: dto.SalaryTypeCode,
        salarytypename: dto.SalaryTypeName,
        salarytypecategorycd: dto.SalaryTypeCategoryCd ?? null,
        salarytypecd: dto.SalaryTypeCd ?? null,
        sortorder: dto.SortOrder ?? null,
        statuscd: dto.StatusCd ?? STATUS_ACTIVE,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
        isactive: true,
      },
    });

    this.logger.log(`SaveData completed | salarytypeid=${record.salarytypeid}`);
    return record;
  }

  // ── PUT /api/salary-type/:id ──────────────────────────────────────────
  async updateData(
    id: number,
    dto: UpdateSalaryTypeDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    await validateUniqueCode(
      this.prisma,
      "hrm_salarytype",
      companyId,
      "salarytypecode",
      dto.SalaryTypeCode,
      "salarytypeid",
      id,
    );

    const updated = await this.prisma.hrm_salarytype.update({
      where: { salarytypeid: id },
      data: {
        salarytypecode: dto.SalaryTypeCode,
        salarytypename: dto.SalaryTypeName,
        salarytypecategorycd: dto.SalaryTypeCategoryCd ?? null,
        salarytypecd: dto.SalaryTypeCd ?? null,
        sortorder: dto.SortOrder ?? null,
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

  // ── DELETE /api/salary-type/:id ───────────────────────────────────────
  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_salarytype.update({
      where: { salarytypeid: id },
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

  // ── GET /api/salary-type ──────────────────────────────────────────────
  async list(companyId: number, isInactiveLoad = false) {
    this.logger.log(
      `List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`,
    );

    const records = await this.prisma.hrm_salarytype.findMany({
      where: {
        isdeleted: false,
        statuscd: STATUS_ACTIVE,
        companyid: companyId,
      },
      orderBy: { createddate: "desc" },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  // ── POST /api/salary-type/list/pagination ─────────────────────────────
  async listPagination(
    dto: PaginationSalaryTypeDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const { search = "", filterList = [], offset = 0, limit = 10 } = dto;
    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, offset=${offset}, limit=${limit}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    // Search — LeaveCode LIKE '%search%' OR LeaveName LIKE '%search%'
    if (search) {
      where.OR = [
        { leavecode: { contains: search } },
        { leavename: { contains: search } },
      ];
    }

    // Date filters — mirrors .NET filterList
    if (filterList?.length > 0) {
      for (const item of filterList) {
        const val = new Date(item.attributeValue);
        if (item.attributeName === "CAST(FromDate AS DATE)") {
          where.OR = [
            ...(where.OR ?? []),
            { fromdate: { gte: val } },
            { todate: { gte: val } },
          ];
        } else if (item.attributeName === "CAST(ToDate AS DATE)") {
          where.OR = [
            ...(where.OR ?? []),
            { todate: { lte: val } },
            { fromdate: { lte: val } },
          ];
        }
      }
    }

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_salarytype.findMany({
        where,
        orderBy: { createddate: "desc" },
        skip: offset,
        take: limit,
      }),
      this.prisma.hrm_salarytype.count({ where }),
    ]);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(records, totalCount);
  }

  // ── GET /api/salary-type/list/search?q= ──────────────────────────────
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
      where.OR = [
        { salarytypecode: { contains: search } },
        { salarytypename: { contains: search } },
      ];
    }

    const records = await this.prisma.hrm_salarytype.findMany({ where });
    this.logger.log(`ListSearch completed | count=${records.length}`);
    return records;
  }
}

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
import { UpdateActiveStatusDto } from "./dto/updateactivestatus.dto";
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
      dto.salarytypecode,
    );

    const record = await this.prisma.hrm_salarytype.create({
      data: {
        salarytypecode: dto.salarytypecode,
        salarytypename: dto.salarytypename,
        salarytypecategorycd: dto.salarytypecategorycd ?? null,
        salarytypecd: dto.salarytypecd ?? null,
        sortorder: dto.sortorder ?? null,
        statuscd: dto.statuscd ?? STATUS_ACTIVE,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
        isactive: dto.isactive ?? true,
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
      dto.salarytypecode,
      "salarytypeid",
      id,
    );

    const updated = await this.prisma.hrm_salarytype.update({
      where: { salarytypeid: id },
      data: {
        salarytypecode: dto.salarytypecode,
        salarytypename: dto.salarytypename,
        salarytypecategorycd: dto.salarytypecategorycd ?? null,
        salarytypecd: dto.salarytypecd ?? null,
        sortorder: dto.sortorder ?? null,
        companyid: companyId,
        modifiedby: currentId,
        modifieddate: new Date(),
        isactive: dto.isactive ?? true,
      },
    });

    if (!updated)
      throw new NotFoundException("Update failed or record not found");

    this.logger.log(`UpdateData completed | id=${id}`);
    return updated;
  }
  async UpdateActiveStatus(id: number, isactive: boolean, currentId: number) {
    this.logger.log(
      `UpdateActiveStatus started | id=${id}, userId=${currentId}`,
    );

    const updated = await this.prisma.hrm_salarytype.update({
      where: { salarytypeid: id },
      data: {
        modifiedby: currentId,
        modifieddate: new Date(),
        isactive: isactive,
      },
    });

    if (!updated)
      throw new NotFoundException("Update failed or record not found");

    this.logger.log(`UpdateActiveStatus completed | id=${id}`);
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
    const {
      search = "",
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = "salarytypeid",
      isDescending = true,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    // ── Full-text search across code and name ──────────────────────────
    if (search?.trim()) {
      where.OR = [
        { salarytypecode: { contains: search, mode: 'insensitive' } },
        { salarytypename: { contains: search, mode: 'insensitive' } },
      ];
    }

    // ── Additional key-value filters ───────────────────────────────────
    if (filters?.length > 0) {
      for (const item of filters) {
        const fieldName = item.field;
        const rawValue = item.value;

        // Boolean fields
        if (rawValue === "true" || rawValue === "false") {
          where[fieldName] = rawValue === "true";
        }
        // Numeric fields
        else if (!isNaN(Number(rawValue)) && rawValue.trim() !== "") {
          where[fieldName] = Number(rawValue);
        }
        // Date fields (ISO format) — only when value is not numeric
        else if (isNaN(Number(rawValue)) && !isNaN(Date.parse(rawValue))) {
          where[fieldName] = new Date(rawValue);
        }
        // String fields — partial match
        else {
          where[fieldName] = { contains: rawValue, mode: 'insensitive' };
        }
      }
    }

    // ── Sorting ────────────────────────────────────────────────────────
    const orderBy: any = { [sortBy]: isDescending ? "desc" : "asc" };
    console.log("orderBy:::", orderBy);
    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_salarytype.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.hrm_salarytype.count({ where }),
    ]);

    // ── Enrich with gen_lookup data for salarytypecd & salarytypecategorycd ──
    const lookupIds = [
      ...new Set(
        records
          .flatMap((r) => [r.salarytypecd, r.salarytypecategorycd])
          .filter((id): id is number => id != null),
      ),
    ];

    const lookupMap = new Map<
      number,
      {
        lookupid: number;
        lookupname: string | null;
        lookupnamear: string | null;
      }
    >();

    if (lookupIds.length > 0) {
      const lookups = await this.prisma.gen_lookup.findMany({
        where: { lookupid: { in: lookupIds } },
        select: { lookupid: true, lookupname: true, lookupnamear: true },
      });
      lookups.forEach((l) => lookupMap.set(l.lookupid, l));
    }

    const enrichedRecords = records.map((r) => ({
      ...r,
      salarytypecdDTO:
        r.salarytypecd != null ? (lookupMap.get(r.salarytypecd) ?? null) : null,
      salarytypecategorycdDTO:
        r.salarytypecategorycd != null
          ? (lookupMap.get(r.salarytypecategorycd) ?? null)
          : null,
    }));

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(enrichedRecords, totalCount);
  }
}

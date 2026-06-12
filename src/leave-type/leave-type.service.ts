import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { validateUniqueCode } from "../common/validators/unique-code.validator";

import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { PaginationLeaveTypeDto } from "./dto/pagination-leave-type.dto";
import { STATUS_ACTIVE } from "../common/constants/status.constants";

@Injectable()
export class LeaveTypeService {
  private readonly logger = new Logger(LeaveTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_leavetype.findUnique({
      where: { leavetypeid: id },
    });

    if (!record) throw new NotFoundException("Record not found");

    this.logger.log(`GetByKey completed | id=${id}`);
    return record;
  }

  async saveData(
    dto: CreateLeaveTypeDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );

    await validateUniqueCode(
      this.prisma,
      "hrm_leavetype",
      companyId,
      "leavetypecode",
      dto.leavetypecode,
    );

    const record = await this.prisma.hrm_leavetype.create({
      data: {
        leavetypecode: dto.leavetypecode,
        leavetypename: dto.leavetypename,
        leavetypecategorycd: dto.leavetypecategorycd ?? null,
        leavetypecd: dto.leavetypecd ?? null,
        maximumleavedays: dto.maximumleavedays ?? null,
        daysbeforeleave: dto.daysbeforeleave ?? null,
        isdocumentmandatory: dto.isdocumentmandatory ?? false,
        statuscd: dto.statuscd ?? STATUS_ACTIVE,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
        isactive: dto.isactive ?? true,
      },
    });

    this.logger.log(`SaveData completed | leavetypeid=${record.leavetypeid}`);
    return record;
  }

  async updateData(
    id: number,
    dto: UpdateLeaveTypeDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    await validateUniqueCode(
      this.prisma,
      "hrm_leavetype",
      companyId,
      "leavetypecode",
      dto.leavetypecode,
      "leavetypeid",
      id,
    );

    const updated = await this.prisma.hrm_leavetype.update({
      where: { leavetypeid: id },
      data: {
        leavetypecode: dto.leavetypecode,
        leavetypename: dto.leavetypename,
        leavetypecategorycd: dto.leavetypecategorycd ?? null,
        leavetypecd: dto.leavetypecd ?? null,
        maximumleavedays: dto.maximumleavedays ?? null,
        daysbeforeleave: dto.daysbeforeleave ?? null,
        isdocumentmandatory: dto.isdocumentmandatory ?? false,
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

    const updated = await this.prisma.hrm_leavetype.update({
      where: { leavetypeid: id },
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

  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_leavetype.update({
      where: { leavetypeid: id },
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

  async list(companyId: number, isInactiveLoad = false) {
    this.logger.log(
      `List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`,
    );

    const records = await this.prisma.hrm_leavetype.findMany({
      where: {
        isdeleted: false,
        statuscd: STATUS_ACTIVE,
        //  isdeleted: { not: true },
        // OR: [
        //   { statuscd: STATUS_ACTIVE },
        //   { statuscd: null }
        // ],
        companyid: companyId,
      },
      orderBy: { createddate: "desc" },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  async listPagination(
    dto: PaginationLeaveTypeDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const {
      search = "",
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = "leavetypeid",
      isDescending = true,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search?.trim()) {
      where.OR = [
        { leavetypecode: { contains: search, mode: 'insensitive' } },
        { leavetypename: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filters?.length > 0) {
      for (const item of filters) {
        const fieldName = item.field;
        const rawValue = item.value;
        if (rawValue === "true" || rawValue === "false") {
          where[fieldName] = rawValue === "true";
        } else if (!isNaN(Number(rawValue)) && rawValue.trim() !== "") {
          where[fieldName] = Number(rawValue);
        } else if (isNaN(Number(rawValue)) && !isNaN(Date.parse(rawValue))) {
          where[fieldName] = new Date(rawValue);
        } else {
          where[fieldName] = { contains: rawValue, mode: 'insensitive' };
        }
      }
    }
    // const orderBy: any = { [sortBy]: isDescending ? "desc" : "asc" };
    // ── Sorting — guard against invalid/empty column names ──────────────
    const validSortColumns = new Set([
      "leavetypeid",
      "leavetypecode",
      "leavetypename",
      "leavetypecategorycd",
      "leavetypecd",
      "maximumleavedays",
      "daysbeforeleave",
      "statuscd",
      "createddate",
      "modifieddate",
    ]);
    const safeSortBy = validSortColumns.has(sortBy) ? sortBy : "leavetypeid";
    const orderBy: any = { [safeSortBy]: isDescending ? "desc" : "asc" };

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_leavetype.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.hrm_leavetype.count({ where }),
    ]);

    const lookupIds = [
      ...new Set(
        records
          .flatMap((r) => [r.leavetypecd, r.leavetypecategorycd])
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
      leavetypecdDTO:
        r.leavetypecd != null ? (lookupMap.get(r.leavetypecd) ?? null) : null,
      leavetypecategorycdDTO:
        r.leavetypecategorycd != null
          ? (lookupMap.get(r.leavetypecategorycd) ?? null)
          : null,
    }));

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(enrichedRecords, totalCount);
  }
}

import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { validateUniqueCode } from "../common/validators/unique-code.validator";
import { PaginatedResult } from "../common/interceptors/response.interceptor";
import { CreateSalaryCertificateReqDto } from "./dto/create-salary-certificate-req.dto";
import { UpdateSalaryCertificateReqDto } from "./dto/update-salary-certificate-req.dto";
import { PaginationSalaryCertificateReqDto } from "./dto/pagination-salary-certificate-req.dto";
import { STATUS_ACTIVE } from "../common/constants/status.constants";

@Injectable()
export class SalaryCertificateReqService {
  private readonly logger = new Logger(SalaryCertificateReqService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── GetByKey ────────────────────────────────────────────────────────────────

  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_salary_certificate_req.findUnique({
      where: { reqid: id },
    });

    if (!record) throw new NotFoundException("Record not found");

    this.logger.log(`GetByKey completed | id=${id}`);
    return record;
  }

  // ─── SaveData ────────────────────────────────────────────────────────────────

  async saveData(
    dto: CreateSalaryCertificateReqDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );

    await validateUniqueCode(
      this.prisma,
      "hrm_salary_certificate_req",
      companyId,
      "reqno",
      dto.reqno,
    );

    const record = await this.prisma.hrm_salary_certificate_req.create({
      data: {
        reqno: dto.reqno,
        reqforcd: dto.reqforcd ?? null,
        reason: dto.reason ?? null,
        passportno: dto.passportno ?? null,
        issuedto: dto.issuedto ?? null,
        approvedby: dto.approvedby ?? null,
        statuscd: dto.statuscd ?? STATUS_ACTIVE,
        isactive: dto.isactive ?? true,
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
    dto: UpdateSalaryCertificateReqDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    if (dto.reqno) {
      await validateUniqueCode(
        this.prisma,
        "hrm_salary_certificate_req",
        companyId,
        "reqno",
        dto.reqno,
        "reqid",
        id,
      );
    }

    const updated = await this.prisma.hrm_salary_certificate_req.update({
      where: { reqid: id },
      data: {
        reqno: dto.reqno,
        reqforcd: dto.reqforcd ?? null,
        reason: dto.reason ?? null,
        passportno: dto.passportno ?? null,
        issuedto: dto.issuedto ?? null,
        approvedby: dto.approvedby ?? null,
        statuscd: dto.statuscd ?? undefined,
        isactive: dto.isactive ?? undefined,
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

  // ─── UpdateActiveStatus ──────────────────────────────────────────────────────────────

  async UpdateActiveStatus(id: number, isactive: boolean, currentId: number) {
    this.logger.log(
      `UpdateActiveStatus started | id=${id}, userId=${currentId}`,
    );

    const updated = await this.prisma.hrm_salary_certificate_req.update({
      where: { reqid: id },
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

  // ─── DeleteData ──────────────────────────────────────────────────────────────

  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_salary_certificate_req.update({
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

    const records = await this.prisma.hrm_salary_certificate_req.findMany({
      where,
      orderBy: { createddate: "desc" },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  // ─── ListPagination ───────────────────────────────────────────────────────────────────────────────

  async listPagination(
    dto: PaginationSalaryCertificateReqDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const {
      search = "",
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = "reqid",
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
        { passportno: { contains: search } },
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
      this.prisma.hrm_salary_certificate_req.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.hrm_salary_certificate_req.count({ where }),
    ]);

    const lookupIds = [
      ...new Set(
        records
          .map((r) => r.reqforcd)
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
      reqforcdDTOList:
        r.reqforcd != null ? (lookupMap.get(r.reqforcd) ?? null) : null,
    }));

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(enrichedRecords, totalCount);
  }
}

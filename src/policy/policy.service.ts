import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateUniqueCode } from '../common/validators/unique-code.validator';
import { PaginatedResult } from '../common/interceptors/response.interceptor';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PaginationPolicyDto } from './dto/pagination-policy.dto';
import { STATUS_ACTIVE } from '../common/constants/status.constants';

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── GetByKey ────────────────────────────────────────────────────────────────

  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_policy.findUnique({
      where: { policyid: id },
    });

    if (!record) throw new NotFoundException('Record not found');

    this.logger.log(`GetByKey completed | id=${id}`);
    return record;
  }

  // ─── SaveData ────────────────────────────────────────────────────────────────

  async saveData(dto: CreatePolicyDto, currentId: number, companyId: number) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );

    await validateUniqueCode(
      this.prisma,
      'hrm_policy',
      companyId,
      'policyno',
      dto.policyno,
    );

    const record = await this.prisma.hrm_policy.create({
      data: {
        policyno: dto.policyno,
        policymessage: dto.policymessage ?? null,
        regulationmessage: dto.regulationmessage ?? null,
        documentgroupid: dto.documentgroupid ?? null,
        statuscd: dto.statuscd ?? STATUS_ACTIVE,
        isactive: dto.isactive ?? true,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
      },
    });

    this.logger.log(`SaveData completed | policyid=${record.policyid}`);
    return record;
  }

  // ─── UpdateData ──────────────────────────────────────────────────────────────

  async updateData(
    id: number,
    dto: UpdatePolicyDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    if (dto.policyno) {
      await validateUniqueCode(
        this.prisma,
        'hrm_policy',
        companyId,
        'policyno',
        dto.policyno,
        'policyid',
        id,
      );
    }

    const updated = await this.prisma.hrm_policy.update({
      where: { policyid: id },
      data: {
        policyno: dto.policyno ?? undefined,
        policymessage: dto.policymessage ?? undefined,
        regulationmessage: dto.regulationmessage ?? undefined,
        documentgroupid: dto.documentgroupid ?? undefined,
        statuscd: dto.statuscd ?? undefined,
        isactive: dto.isactive ?? undefined,
        companyid: companyId,
        modifiedby: currentId,
        modifieddate: new Date(),
      },
    });

    if (!updated) throw new NotFoundException('Update failed or record not found');

    this.logger.log(`UpdateData completed | id=${id}`);
    return updated;
  }

  // ─── UpdateActiveStatus ──────────────────────────────────────────────────────

  async UpdateActiveStatus(id: number, isactive: boolean, currentId: number) {
    this.logger.log(
      `UpdateActiveStatus started | id=${id}, userId=${currentId}`,
    );

    const updated = await this.prisma.hrm_policy.update({
      where: { policyid: id },
      data: {
        isactive: isactive,
        modifiedby: currentId,
        modifieddate: new Date(),
      },
    });

    if (!updated) throw new NotFoundException('Update failed or record not found');

    this.logger.log(`UpdateActiveStatus completed | id=${id}`);
    return updated;
  }

  // ─── DeleteData ──────────────────────────────────────────────────────────────

  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_policy.update({
      where: { policyid: id },
      data: {
        isdeleted: true,
        deleteby: currentId,
        deletedate: new Date(),
      },
    });

    if (!updated) throw new NotFoundException('Record not found');

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

    const records = await this.prisma.hrm_policy.findMany({
      where,
      orderBy: { createddate: 'desc' },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  // ─── ListPagination ──────────────────────────────────────────────────────────

  async listPagination(
    dto: PaginationPolicyDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const {
      search = '',
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'policyid',
      isDescending = true,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search?.trim()) {
      where.OR = [
        { policyno: { contains: search, mode: 'insensitive' } },
        { policymessage: { contains: search, mode: 'insensitive' } },
        { regulationmessage: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filters?.length > 0) {
      for (const item of filters) {
        const fieldName = item.field;
        const rawValue = item.value;
        if (rawValue === 'true' || rawValue === 'false') {
          where[fieldName] = rawValue === 'true';
        } else if (!isNaN(Number(rawValue)) && rawValue.trim() !== '') {
          where[fieldName] = Number(rawValue);
        } else if (isNaN(Number(rawValue)) && !isNaN(Date.parse(rawValue))) {
          where[fieldName] = new Date(rawValue);
        } else {
          where[fieldName] = { contains: rawValue, mode: 'insensitive' };
        }
      }
    }

    // ── Sorting — guard against invalid/empty column names ──────────────
    const validSortColumns = new Set([
      'policyid',
      'policyno',
      'policymessage',
      'regulationmessage',
      'statuscd',
      'isactive',
      'createddate',
      'modifieddate',
    ]);
    const safeSortBy = validSortColumns.has(sortBy) ? sortBy : 'policyid';
    const orderBy: any = { [safeSortBy]: isDescending ? 'desc' : 'asc' };

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_policy.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.hrm_policy.count({ where }),
    ]);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(records, totalCount);
  }
}

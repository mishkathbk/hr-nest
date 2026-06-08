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
      dto.policyNo,
    );

    const record = await this.prisma.hrm_policy.create({
      data: {
        policyno: dto.policyNo,
        policymessage: dto.policyMessage ?? null,
        regulationmessage: dto.regulationMessage ?? null,
        documentgroupid: dto.documentGroupId ?? null,
        statuscd: dto.statusCd ?? STATUS_ACTIVE,
        isactive: dto.isActive ?? true,
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

    if (dto.policyNo) {
      await validateUniqueCode(
        this.prisma,
        'hrm_policy',
        companyId,
        'policyno',
        dto.policyNo,
        'policyid',
        id,
      );
    }

    const updated = await this.prisma.hrm_policy.update({
      where: { policyid: id },
      data: {
        policyno: dto.policyNo,
        policymessage: dto.policyMessage ?? null,
        regulationmessage: dto.regulationMessage ?? null,
        documentgroupid: dto.documentGroupId ?? null,
        statuscd: dto.statusCd ?? undefined,
        isactive: dto.isActive ?? undefined,
        companyid: companyId,
        modifiedby: currentId,
        modifieddate: new Date(),
      },
    });

    if (!updated) throw new NotFoundException('Update failed or record not found');

    this.logger.log(`UpdateData completed | id=${id}`);
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
    const { search = '', filterList = [], offset = 0, limit = 10 } = dto;
    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, offset=${offset}, limit=${limit}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search) {
      where.AND = [
        {
          OR: [
            { policyno: { contains: search } },
            { policymessage: { contains: search } },
          ],
        },
      ];
    }

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_policy.findMany({
        where,
        orderBy: { createddate: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.hrm_policy.count({ where }),
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
            { policyno: { contains: search } },
            { policymessage: { contains: search } },
          ],
        },
      ];
    }

    const records = await this.prisma.hrm_policy.findMany({ where });
    this.logger.log(`ListSearch completed | count=${records.length}`);
    return records;
  }
}

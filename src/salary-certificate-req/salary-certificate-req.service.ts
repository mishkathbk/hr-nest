import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateUniqueCode } from '../common/validators/unique-code.validator';
import { PaginatedResult } from '../common/interceptors/response.interceptor';
import { CreateSalaryCertificateReqDto } from './dto/create-salary-certificate-req.dto';
import { UpdateSalaryCertificateReqDto } from './dto/update-salary-certificate-req.dto';
import { PaginationSalaryCertificateReqDto } from './dto/pagination-salary-certificate-req.dto';
import { STATUS_ACTIVE } from '../common/constants/status.constants';

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

    if (!record) throw new NotFoundException('Record not found');

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
      'hrm_salary_certificate_req',
      companyId,
      'reqno',
      dto.reqNo,
    );

    const record = await this.prisma.hrm_salary_certificate_req.create({
      data: {
        reqno: dto.reqNo,
        reqdate: dto.reqDate ? new Date(dto.reqDate) : null,
        passporto: dto.passporto ?? null,
        approvedby: dto.approvedBy ?? null,
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
    dto: UpdateSalaryCertificateReqDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    if (dto.reqNo) {
      await validateUniqueCode(
        this.prisma,
        'hrm_salary_certificate_req',
        companyId,
        'reqno',
        dto.reqNo,
        'reqid',
        id,
      );
    }

    const updated = await this.prisma.hrm_salary_certificate_req.update({
      where: { reqid: id },
      data: {
        reqno: dto.reqNo,
        reqdate: dto.reqDate ? new Date(dto.reqDate) : undefined,
        passporto: dto.passporto ?? null,
        approvedby: dto.approvedBy ?? null,
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

    const updated = await this.prisma.hrm_salary_certificate_req.update({
      where: { reqid: id },
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

    const records = await this.prisma.hrm_salary_certificate_req.findMany({
      where,
      orderBy: { createddate: 'desc' },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  // ─── ListPagination ──────────────────────────────────────────────────────────

  async listPagination(
    dto: PaginationSalaryCertificateReqDto,
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
            { reqno: { contains: search } },
            { passporto: { contains: search } },
          ],
        },
      ];
    }

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_salary_certificate_req.findMany({
        where,
        orderBy: { createddate: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.hrm_salary_certificate_req.count({ where }),
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
            { passporto: { contains: search } },
          ],
        },
      ];
    }

    const records = await this.prisma.hrm_salary_certificate_req.findMany({
      where,
    });
    this.logger.log(`ListSearch completed | count=${records.length}`);
    return records;
  }
}

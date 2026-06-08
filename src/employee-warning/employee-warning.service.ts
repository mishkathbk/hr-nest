import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/interceptors/response.interceptor';
import { CreateEmployeeWarningDto } from './dto/create-employee-warning.dto';
import { UpdateEmployeeWarningDto } from './dto/update-employee-warning.dto';
import { PaginationEmployeeWarningDto } from './dto/pagination-employee-warning.dto';
import { STATUS_ACTIVE } from '../common/constants/status.constants';

@Injectable()
export class EmployeeWarningService {
  private readonly logger = new Logger(EmployeeWarningService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── GetByKey ────────────────────────────────────────────────────────────────

  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrm_employeewarning.findUnique({
      where: { employeewarningid: id },
    });

    if (!record) throw new NotFoundException('Record not found');

    const withEmployee = await this.attachEmployeeNames([record]);

    this.logger.log(`GetByKey completed | id=${id}`);
    return withEmployee[0];
  }

  // ─── SaveData ────────────────────────────────────────────────────────────────

  async saveData(
    dto: CreateEmployeeWarningDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(
      `SaveData started | userId=${currentId}, companyId=${companyId}`,
    );

    const record = await this.prisma.hrm_employeewarning.create({
      data: {
        employeeid: dto.employeeId,
        subject: dto.subject ?? null,
        warningmessage: dto.warningMessage ?? null,
        statuscd: dto.statusCd ?? STATUS_ACTIVE,
        isactive: dto.isActive ?? true,
        companyid: companyId,
        createdby: currentId,
        createddate: new Date(),
        isdeleted: false,
      },
    });

    this.logger.log(`SaveData completed | employeewarningid=${record.employeewarningid}`);
    return record;
  }

  // ─── UpdateData ──────────────────────────────────────────────────────────────

  async updateData(
    id: number,
    dto: UpdateEmployeeWarningDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrm_employeewarning.update({
      where: { employeewarningid: id },
      data: {
        employeeid: dto.employeeId ?? undefined,
        subject: dto.subject ?? undefined,
        warningmessage: dto.warningMessage ?? undefined,
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

    const updated = await this.prisma.hrm_employeewarning.update({
      where: { employeewarningid: id },
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

    const records = await this.prisma.hrm_employeewarning.findMany({
      where,
      orderBy: { createddate: 'desc' },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return await this.attachEmployeeNames(records);
  }

  // ─── ListPagination ──────────────────────────────────────────────────────────

  async listPagination(
    dto: PaginationEmployeeWarningDto,
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
            { subject: { contains: search } },
            { warningmessage: { contains: search } },
          ],
        },
      ];
    }

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrm_employeewarning.findMany({
        where,
        orderBy: { createddate: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.hrm_employeewarning.count({ where }),
    ]);

    const recordsWithEmployeeNames = await this.attachEmployeeNames(records);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(recordsWithEmployeeNames, totalCount);
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
            { subject: { contains: search } },
            { warningmessage: { contains: search } },
          ],
        },
      ];
    }

    const records = await this.prisma.hrm_employeewarning.findMany({
      where,
    });
    
    const recordsWithEmployeeNames = await this.attachEmployeeNames(records);
    this.logger.log(`ListSearch completed | count=${records.length}`);
    return recordsWithEmployeeNames;
  }

  private async attachEmployeeNames(records: any[]) {
    if (!records || records.length === 0) return records;

    const employeeIds = [...new Set(records.map((r) => r.employeeid).filter(Boolean))];
    
    if (employeeIds.length === 0) return records;

    const employees = await this.prisma.hrm_employee.findMany({
      where: { employeeid: { in: employeeIds } },
      select: { employeeid: true, employeename: true },
    });

    const employeeMap = new Map(employees.map((e) => [e.employeeid, e.employeename]));

    return records.map((r) => ({
      ...r,
      employeename: employeeMap.get(r.employeeid) || null,
    }));
  }
}


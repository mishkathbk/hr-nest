import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveCalendarDto } from './dto/create-leave-calendar.dto';
import { UpdateLeaveCalendarDto } from './dto/update-leave-calendar.dto';
import { PaginationLeaveCalendarDto } from './dto/pagination-leave-calendar.dto';
import { PaginatedResult } from '../common/interceptors/response.interceptor';
import { STATUS_ACTIVE } from 'src/common/constants/status.constants';


@Injectable()
export class LeaveCalendarService {
  private readonly logger = new Logger(LeaveCalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── GET /api/leave-calendar/:id ─────────────────────────────────────────
  async getByKey(id: number) {
    this.logger.log(`GetByKey started | id=${id}`);

    const record = await this.prisma.hrmLeaveCalendar.findUnique({
      where: { leavecalendarid: id },
    });

    if (!record) throw new NotFoundException('Record not found');

    this.logger.log(`GetByKey completed | id=${id}`);
    return record;
  }

  // ── POST /api/leave-calendar ─────────────────────────────────────────────
  async saveData(
    dto: CreateLeaveCalendarDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);

    const record = await this.prisma.hrmLeaveCalendar.create({
      data: {
        leavecode:   dto.LeaveCode,
        leavename:   dto.LeaveName,
        fromdate:    dto.FromDate ? new Date(dto.FromDate) : null,
        todate:      dto.ToDate   ? new Date(dto.ToDate)   : null,
        statuscd:    dto.StatusCd ?? STATUS_ACTIVE,
        notes1:      dto.Description ?? null,
        companyid:   companyId,
        createdby:   currentId,
        createddate: new Date(),
        isdeleted:   false,
      },
    });

    this.logger.log(
      `SaveData completed | leavecalendarid=${record.leavecalendarid}`,
    );
    return record;
  }

  // ── PUT /api/leave-calendar/:id ──────────────────────────────────────────
  async updateData(
    id: number,
    dto: UpdateLeaveCalendarDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrmLeaveCalendar.update({
      where: { leavecalendarid: id },
      data: {
        leavecode:   dto.LeaveCode,
        leavename:   dto.LeaveName,
        fromdate:    dto.FromDate ? new Date(dto.FromDate) : null,
        todate:      dto.ToDate   ? new Date(dto.ToDate)   : null,
        statuscd:    dto.StatusCd,
        notes1:      dto.Description ?? null,
        companyid:   companyId,
        modifiedby:  currentId,
        modifieddate: new Date(),
      },
    });

    if (!updated) throw new NotFoundException('Update failed or record not found');

    this.logger.log(`UpdateData completed | id=${id}`);
    return updated;
  }

  // ── DELETE /api/leave-calendar/:id ───────────────────────────────────────
  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    const updated = await this.prisma.hrmLeaveCalendar.update({
      where: { leavecalendarid: id },
      data: {
        isdeleted:  true,
        deleteby:   currentId,
        deletedate: new Date(),
      },
    });

    if (!updated) throw new NotFoundException('Record not found');

    this.logger.log(`DeleteData completed | id=${id}`);
    return { deleted: true };
  }

  // ── GET /api/leave-calendar ──────────────────────────────────────────────
  async list(companyId: number, isInactiveLoad = false) {
    this.logger.log(`List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`);

    const records = await this.prisma.hrmLeaveCalendar.findMany({
      where: {
        isdeleted: false,
        statuscd:  STATUS_ACTIVE,
        companyid: companyId,
      },
      orderBy: { createddate: 'desc' },
    });

    this.logger.log(`List completed | count=${records.length}`);
    return records;
  }

  // ── POST /api/leave-calendar/list/pagination ─────────────────────────────
  async listPagination(
    dto: PaginationLeaveCalendarDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const { search = '', filterList = [], offset = 0, limit = 10 } = dto;
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
        if (item.attributeName === 'CAST(FromDate AS DATE)') {
          where.OR = [
            ...(where.OR ?? []),
            { fromdate: { gte: val } },
            { todate:   { gte: val } },
          ];
        } else if (item.attributeName === 'CAST(ToDate AS DATE)') {
          where.OR = [
            ...(where.OR ?? []),
            { todate:   { lte: val } },
            { fromdate: { lte: val } },
          ];
        }
      }
    }

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.hrmLeaveCalendar.findMany({
        where,
        orderBy: { createddate: 'desc' },
        skip:  offset,
        take:  limit,
      }),
      this.prisma.hrmLeaveCalendar.count({ where }),
    ]);

    this.logger.log(
      `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    );
    return new PaginatedResult(records, totalCount);
  }

  // ── GET /api/leave-calendar/list/search?q= ──────────────────────────────
  async listSearch(search: string, companyId: number) {
    this.logger.log(`ListSearch started | companyId=${companyId}, search=${search}`);

    const where: any = {
      isdeleted: false,
      statuscd:  STATUS_ACTIVE,
      companyid: companyId,
    };

    if (search) {
      where.OR = [
        { leavecode: { contains: search } },
        { leavename: { contains: search } },
      ];
    }

    const records = await this.prisma.hrmLeaveCalendar.findMany({ where });
    this.logger.log(`ListSearch completed | count=${records.length}`);
    return records;
  }
}

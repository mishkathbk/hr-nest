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

    // const record = await this.prisma.hrmLeaveCalendar.findUnique({
    //   where: { leavecalendarid: id },
    // });

    // if (!record) throw new NotFoundException('Record not found');

    // this.logger.log(`GetByKey completed | id=${id}`);
    // return record;
  }

  // ── POST /api/leave-calendar ─────────────────────────────────────────────
  async saveData(
    dto: CreateLeaveCalendarDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);

    // const record = await this.prisma.hrmLeaveCalendar.create({
    //   data: {
    //     leavecode:   dto.LeaveCode,
    //     leavename:   dto.LeaveName,
    //     fromdate:    dto.FromDate ? new Date(dto.FromDate) : null,
    //     todate:      dto.ToDate   ? new Date(dto.ToDate)   : null,
    //     statuscd:    dto.StatusCd ?? STATUS_ACTIVE,
    //     notes1:      dto.Description ?? null,
    //     companyid:   companyId,
    //     createdby:   currentId,
    //     createddate: new Date(),
    //     isdeleted:   false,
    //   },
    // });

    // this.logger.log(
    //   `SaveData completed | leavecalendarid=${record.leavecalendarid}`,
    // );
    // return record;
  }

  // ── PUT /api/leave-calendar/:id ──────────────────────────────────────────
  async updateData(
    id: number,
    dto: UpdateLeaveCalendarDto,
    currentId: number,
    companyId: number,
  ) {
    this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);

    // const updated = await this.prisma.hrmLeaveCalendar.update({
    //   where: { leavecalendarid: id },
    //   data: {
    //     leavecode:   dto.LeaveCode,
    //     leavename:   dto.LeaveName,
    //     fromdate:    dto.FromDate ? new Date(dto.FromDate) : null,
    //     todate:      dto.ToDate   ? new Date(dto.ToDate)   : null,
    //     statuscd:    dto.StatusCd,
    //     notes1:      dto.Description ?? null,
    //     companyid:   companyId,
    //     modifiedby:  currentId,
    //     modifieddate: new Date(),
    //   },
    // });

    // if (!updated) throw new NotFoundException('Update failed or record not found');

    // this.logger.log(`UpdateData completed | id=${id}`);
    // return updated;
  }

  // ── DELETE /api/leave-calendar/:id ───────────────────────────────────────
  async deleteData(id: number, currentId: number) {
    this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);

    // const updated = await this.prisma.hrmLeaveCalendar.update({
    //   where: { leavecalendarid: id },
    //   data: {
    //     isdeleted:  true,
    //     deleteby:   currentId,
    //     deletedate: new Date(),
    //   },
    // });

    // if (!updated) throw new NotFoundException('Record not found');

    // this.logger.log(`DeleteData completed | id=${id}`);
    return { deleted: true };
  }

  // ── GET /api/leave-calendar ──────────────────────────────────────────────
  async list(companyId: number, isInactiveLoad = false) {
    this.logger.log(`List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`);

    // const records = await this.prisma.hrmLeaveCalendar.findMany({
    //   where: {
    //     isdeleted: false,
    //     statuscd:  STATUS_ACTIVE,
    //     companyid: companyId,
    //   },
    //   orderBy: { createddate: 'desc' },
    // });

    // this.logger.log(`List completed | count=${records.length}`);
    // return records;
  }

  // ── POST /api/leave-calendar/list/pagination ────────────────────────────────────
  async listPagination(
    dto: PaginationLeaveCalendarDto,
    companyId: number,
  ): Promise<PaginatedResult<any>> {
    const {
      search = '',
      filters = [],
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'leavecalendarid',
      isDescending = true,
    } = dto;

    const skip = (pageNumber - 1) * pageSize;

    this.logger.log(
      `ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`,
    );

    const where: any = { isdeleted: false, companyid: companyId };

    if (search?.trim()) {
      where.OR = [
        { leavecode: { contains: search } },
        { leavename: { contains: search } },
      ];
    }

    if (filters?.length > 0) {
      for (const item of filters) {
        const fieldName = item.attributeName;
        const rawValue = item.attributeValue;
        if (rawValue === 'true' || rawValue === 'false') {
          where[fieldName] = rawValue === 'true';
        } else if (!isNaN(Number(rawValue)) && rawValue.trim() !== '') {
          where[fieldName] = Number(rawValue);
        } else if (!isNaN(Date.parse(rawValue))) {
          where[fieldName] = new Date(rawValue);
        } else {
          where[fieldName] = { contains: rawValue };
        }
      }
    }

    const orderBy: any = { [sortBy]: isDescending ? 'desc' : 'asc' };

    // const [records, totalCount] = await this.prisma.$transaction([
    //   this.prisma.hrmLeaveCalendar.findMany({
    //     where,
    //     orderBy,
    //     skip,
    //     take: pageSize,
    //   }),
    //   this.prisma.hrmLeaveCalendar.count({ where }),
    // ]);

    // this.logger.log(
    //   `ListPagination completed | count=${records.length}, totalCount=${totalCount}`,
    // );
    // return new PaginatedResult(records, totalCount);
    return;
  }
}

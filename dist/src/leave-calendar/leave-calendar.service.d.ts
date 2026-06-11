import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveCalendarDto } from './dto/create-leave-calendar.dto';
import { UpdateLeaveCalendarDto } from './dto/update-leave-calendar.dto';
import { PaginationLeaveCalendarDto } from './dto/pagination-leave-calendar.dto';
import { PaginatedResult } from '../common/interceptors/response.interceptor';
export declare class LeaveCalendarService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getByKey(id: number): Promise<void>;
    saveData(dto: CreateLeaveCalendarDto, currentId: number, companyId: number): Promise<void>;
    updateData(id: number, dto: UpdateLeaveCalendarDto, currentId: number, companyId: number): Promise<void>;
    deleteData(id: number, currentId: number): Promise<{
        deleted: boolean;
    }>;
    list(companyId: number, isInactiveLoad?: boolean): Promise<void>;
    listPagination(dto: PaginationLeaveCalendarDto, companyId: number): Promise<PaginatedResult<any>>;
}

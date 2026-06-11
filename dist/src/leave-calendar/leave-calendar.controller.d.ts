import { LeaveCalendarService } from './leave-calendar.service';
import { CreateLeaveCalendarDto } from './dto/create-leave-calendar.dto';
import { UpdateLeaveCalendarDto } from './dto/update-leave-calendar.dto';
import { PaginationLeaveCalendarDto } from './dto/pagination-leave-calendar.dto';
export declare class LeaveCalendarController {
    private readonly leaveCalendarService;
    constructor(leaveCalendarService: LeaveCalendarService);
    listPagination(dto: PaginationLeaveCalendarDto, companyId: number): Promise<import("../common/interceptors/response.interceptor").PaginatedResult<any>>;
    list(inactive: string, companyId: number): Promise<void>;
    getByKey(id: number): Promise<void>;
    saveData(dto: CreateLeaveCalendarDto, currentId: number, companyId: number): Promise<void>;
    updateData(id: number, dto: UpdateLeaveCalendarDto, currentId: number, companyId: number): Promise<void>;
    deleteData(id: number, currentId: number): Promise<{
        deleted: boolean;
    }>;
}

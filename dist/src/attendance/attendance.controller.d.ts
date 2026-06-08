import { AttendanceService } from './attendance.service';
import { GetByDateDto } from './dto/get-by-date.dto';
import { SaveByDateDto } from './dto/save-by-date.dto';
import { MonthlyGridDto } from './dto/monthly-grid.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    getByDate(dto: GetByDateDto, companyId: number): Promise<{
        attendanceid: number;
        attendancedate: string;
        employeeid: number;
        employeename: string;
        departmentname: string;
        totalhour: number;
        ismanual: boolean;
        notes: string;
        checkIns: {
            attendancedetid: number;
            attendancetime: Date;
            attendancesourcetypecd: number;
            notes: string;
        }[];
        checkOuts: {
            attendancedetid: number;
            attendancetime: Date;
            attendancesourcetypecd: number;
            notes: string;
        }[];
    }>;
    saveByDate(dto: SaveByDateDto, currentId: number, companyId: number): Promise<{
        attendanceid: number;
        totalHour: number;
    }>;
    getMonthlyGrid(dto: MonthlyGridDto, companyId: number): Promise<{
        month: number;
        year: number;
        totalCount: number;
        days: {
            day: number;
            date: string;
            dayName: string;
            dayShort: string;
        }[];
        employees: {
            employeeid: number;
            employeename: string;
            departmentname: string;
            monthlyTotalHour: number;
            days: ({
                day: number;
                date: string;
                status: string;
                label: string;
                totalHour: any;
                startTime: any;
                endTime: any;
                checkIns: any[];
                checkOuts: any[];
                attendanceid?: undefined;
                ismanual?: undefined;
            } | {
                day: number;
                date: string;
                status: string;
                label: string;
                totalHour: number;
                startTime: Date;
                endTime: Date;
                attendanceid: number;
                ismanual: boolean;
                checkIns: {
                    attendancedetid: number;
                    attendancetime: Date;
                    attendancesourcetypecd: number;
                }[];
                checkOuts: {
                    attendancedetid: number;
                    attendancetime: Date;
                    attendancesourcetypecd: number;
                }[];
            })[];
        }[];
    }>;
}

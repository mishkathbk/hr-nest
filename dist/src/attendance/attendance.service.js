"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AttendanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const save_by_date_dto_1 = require("./dto/save-by-date.dto");
const TYPE_CHECKIN = 1;
const TYPE_CHECKOUT = 2;
let AttendanceService = AttendanceService_1 = class AttendanceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AttendanceService_1.name);
    }
    async getByDate(dto, companyId) {
        this.logger.log(`GetByDate started | employeeId=${dto.employeeId}, date=${dto.date}`);
        const startOfDay = new Date(`${dto.date}T00:00:00.000`);
        const endOfDay = new Date(`${dto.date}T23:59:59.999`);
        const employee = await this.prisma.hrm_employee.findUnique({
            where: { employeeid: dto.employeeId },
            select: {
                employeeid: true,
                employeename: true,
                departmentid: true,
                hrm_department: { select: { departmentname: true } },
            },
        });
        if (!employee)
            throw new common_1.NotFoundException("Employee not found");
        const attendance = await this.prisma.hrm_attendance.findFirst({
            where: {
                employeeid: dto.employeeId,
                companyid: companyId,
                isdeleted: false,
                attendancedate: { gte: startOfDay, lte: endOfDay },
            },
            include: {
                hrm_attendancedet: {
                    where: { isdeleted: false },
                    orderBy: { attendancetime: "asc" },
                },
            },
        });
        const det = attendance?.hrm_attendancedet ?? [];
        const allCheckIns = det
            .filter((d) => d.typeid === TYPE_CHECKIN)
            .sort((a, b) => a.attendancedetid - b.attendancedetid);
        const allCheckOuts = det
            .filter((d) => d.typeid === TYPE_CHECKOUT)
            .sort((a, b) => b.attendancedetid - a.attendancedetid);
        const formatDet = (d) => ({
            attendancedetid: d.attendancedetid,
            attendancetime: d.attendancetime,
            attendancesourcetypecd: attendance?.attendancesourcetypecd ?? null,
            notes: d.notes1,
        });
        this.logger.log(`GetByDate completed | attendanceid=${attendance?.attendanceid ?? "none"}`);
        return {
            attendanceid: attendance?.attendanceid ?? null,
            attendancedate: dto.date,
            employeeid: employee.employeeid,
            employeename: employee.employeename,
            departmentname: employee.hrm_department?.departmentname ?? null,
            totalhour: attendance?.totalhour ?? null,
            ismanual: attendance?.ismanual ?? false,
            notes: attendance?.notes1 ?? null,
            checkIns: allCheckIns.map(formatDet),
            checkOuts: allCheckOuts.map(formatDet),
        };
    }
    async saveByDate(dto, currentId, companyId) {
        this.logger.log(`SaveByDate started | employeeId=${dto.employeeId}, date=${dto.attendanceDate}`);
        const employee = await this.prisma.hrm_employee.findUnique({
            where: { employeeid: dto.employeeId },
            select: { employeeid: true },
        });
        if (!employee) {
            this.logger.warn(`SaveByDate failed | Employee ID ${dto.employeeId} not found in database.`);
            throw new common_1.NotFoundException(`Employee with ID ${dto.employeeId} not found`);
        }
        const dateOnly = dto.attendanceDate.split("T")[0];
        const startOfDay = new Date(`${dateOnly}T00:00:00.000`);
        const endOfDay = new Date(`${dateOnly}T23:59:59.999`);
        const detList = dto.attendanceDetDTOList || [];
        if (dto.attendanceSourceTypeCd === save_by_date_dto_1.ATTENDANCE_SOURCE_MOBILE) {
            const uaeNow = this.getCurrentUaeTime();
            this.logger.log(`Mobile attendance — using UAE server time: ${uaeNow}`);
            for (const item of detList) {
                item.attTime = uaeNow;
            }
        }
        const existing = await this.prisma.hrm_attendance.findFirst({
            where: {
                employeeid: dto.employeeId,
                companyid: companyId,
                isdeleted: false,
                attendancedate: { gte: startOfDay, lte: endOfDay },
            },
            include: {
                hrm_attendancedet: {
                    where: { isdeleted: false },
                    orderBy: { attendancetime: "asc" },
                },
            },
        });
        let effectiveCheckIn = null;
        let effectiveCheckOut = null;
        const checkInDet = detList.find((d) => d.typeId === TYPE_CHECKIN);
        const checkOutDet = detList.find((d) => d.typeId === TYPE_CHECKOUT);
        if (existing) {
            const existingCheckIn = existing.hrm_attendancedet
                .filter((d) => d.typeid === TYPE_CHECKIN)
                .sort((a, b) => a.attendancedetid - b.attendancedetid)[0];
            if (existingCheckIn?.attendancetime) {
                const t = existingCheckIn.attendancetime;
                effectiveCheckIn = `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}`;
            }
            if (checkInDet?.attTime)
                effectiveCheckIn = checkInDet.attTime;
            if (checkOutDet?.attTime)
                effectiveCheckOut = checkOutDet.attTime;
        }
        else {
            if (checkInDet?.attTime)
                effectiveCheckIn = checkInDet.attTime;
            if (checkOutDet?.attTime)
                effectiveCheckOut = checkOutDet.attTime;
        }
        let totalHour = 0;
        if (effectiveCheckIn && effectiveCheckOut) {
            const [inH, inM] = effectiveCheckIn.split(":").map(Number);
            const [outH, outM] = effectiveCheckOut.split(":").map(Number);
            const checkInMs = inH * 60 + inM;
            const checkOutMs = outH * 60 + outM;
            if (checkOutMs < checkInMs) {
                throw new common_1.BadRequestException("Check-out time cannot be earlier than check-in time.");
            }
            const diffMinutes = checkOutMs - checkInMs;
            const totalHoursInt = Math.floor(diffMinutes / 60);
            const remainingMinutes = diffMinutes % 60;
            totalHour = parseFloat((totalHoursInt + remainingMinutes / 60).toFixed(2));
        }
        let attendanceid;
        if (existing) {
            await this.prisma.hrm_attendance.update({
                where: { attendanceid: existing.attendanceid },
                data: {
                    totalhour: totalHour,
                    ismanual: dto.isManual ?? existing.ismanual,
                    notes1: dto.notes ?? existing.notes1,
                    attendancesourcetypecd: dto.attendanceSourceTypeCd ?? existing.attendancesourcetypecd,
                    modifyby: currentId,
                    modifieddate: new Date(),
                },
            });
            attendanceid = existing.attendanceid;
            await this.prisma.hrm_attendancedet.updateMany({
                where: { attendanceid, isdeleted: false, createby: currentId },
                data: { isdeleted: true, deleteby: currentId, deletedate: new Date() },
            });
        }
        else {
            const created = await this.prisma.hrm_attendance.create({
                data: {
                    employeeid: dto.employeeId,
                    attendancedate: startOfDay,
                    totalhour: totalHour,
                    companyid: companyId,
                    ismanual: dto.isManual ?? true,
                    attendancesourcetypecd: dto.attendanceSourceTypeCd ?? null,
                    notes1: dto.notes ?? null,
                    isdeleted: false,
                    createby: currentId,
                    createdate: new Date(),
                },
            });
            attendanceid = created.attendanceid;
        }
        const detRows = [];
        for (const item of detList) {
            if (item.attTime) {
                detRows.push({
                    attendanceid,
                    typeid: item.typeId,
                    attendancetime: this.buildTime(dateOnly, item.attTime),
                    companyid: companyId,
                    isdeleted: false,
                    createby: currentId,
                    createdate: new Date(),
                });
            }
        }
        if (detRows.length > 0) {
            await this.prisma.hrm_attendancedet.createMany({ data: detRows });
        }
        this.logger.log(`SaveByDate completed | attendanceid=${attendanceid}`);
        return { attendanceid, totalHour };
    }
    async getMonthlyGrid(dto, companyId) {
        const { month, year, departmentId, employeeId, search = "", offset = 0, limit = 10, } = dto;
        this.logger.log(`GetMonthlyGrid started | month=${month}, year=${year}, companyId=${companyId}`);
        const firstDay = new Date(Date.UTC(year, month - 1, 1));
        const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        const daysInMonth = lastDay.getUTCDate();
        const employeeWhere = {
            companyid: companyId,
            isactive: true,
        };
        if (departmentId)
            employeeWhere.departmentid = departmentId;
        if (employeeId)
            employeeWhere.employeeid = employeeId;
        if (search) {
            employeeWhere.employeename = { contains: search };
        }
        const totalCount = await this.prisma.hrm_employee.count({
            where: employeeWhere,
        });
        const employees = await this.prisma.hrm_employee.findMany({
            where: employeeWhere,
            select: {
                employeeid: true,
                employeename: true,
                departmentid: true,
                holiday: true,
                hrm_department: { select: { departmentname: true } },
            },
            orderBy: { createddate: "desc" },
            skip: offset,
            take: limit,
        });
        if (employees.length === 0) {
            return {
                month,
                year,
                days: this.buildDayHeaders(year, month, daysInMonth),
                employees: [],
                totalCount,
            };
        }
        const employeeIds = employees.map((e) => e.employeeid);
        const attendanceRecords = await this.prisma.hrm_attendance.findMany({
            where: {
                companyid: companyId,
                isdeleted: false,
                employeeid: { in: employeeIds },
                attendancedate: { gte: firstDay, lte: lastDay },
            },
            include: {
                hrm_attendancedet: {
                    where: { isdeleted: false },
                    orderBy: { attendancetime: "asc" },
                },
            },
        });
        const attendanceMap = new Map();
        for (const record of attendanceRecords) {
            const empId = record.employeeid;
            const day = new Date(record.attendancedate).getUTCDate();
            if (!attendanceMap.has(empId))
                attendanceMap.set(empId, new Map());
            attendanceMap.get(empId).set(day, record);
        }
        const days = this.buildDayHeaders(year, month, daysInMonth);
        const employeeRows = employees.map((emp) => {
            const weekendDays = (emp.holiday ?? "Saturday,Sunday")
                .split(",")
                .map((d) => d.trim().toLowerCase());
            const empAttendance = attendanceMap.get(emp.employeeid);
            let monthlyTotalHour = 0;
            const dailyStatus = days.map((d) => {
                const isWeekend = weekendDays.includes(d.dayName.toLowerCase());
                if (isWeekend) {
                    return {
                        day: d.day,
                        date: d.date,
                        status: "W",
                        label: "Weekend",
                        totalHour: null,
                        startTime: null,
                        endTime: null,
                        checkIns: [],
                        checkOuts: [],
                    };
                }
                const record = empAttendance?.get(d.day);
                if (!record) {
                    return {
                        day: d.day,
                        date: d.date,
                        status: "A",
                        label: "-",
                        totalHour: null,
                        startTime: null,
                        endTime: null,
                        checkIns: [],
                        checkOuts: [],
                    };
                }
                const det = record.hrm_attendancedet ?? [];
                const checkInDets = det
                    .filter((d) => d.typeid === TYPE_CHECKIN)
                    .sort((a, b) => a.attendancedetid - b.attendancedetid);
                const checkOutDets = det
                    .filter((d) => d.typeid === TYPE_CHECKOUT)
                    .sort((a, b) => b.attendancedetid - a.attendancedetid);
                const startTime = checkInDets[0]?.attendancetime ?? null;
                const endTime = checkOutDets[0]?.attendancetime ?? null;
                let totalHour = 0;
                if (startTime && endTime) {
                    const inDate = new Date(startTime);
                    const outDate = new Date(endTime);
                    const diffMs = outDate.getTime() - inDate.getTime();
                    if (diffMs > 0) {
                        totalHour = parseFloat((diffMs / 1000 / 3600).toFixed(2));
                    }
                }
                monthlyTotalHour += totalHour;
                const totalHrs = totalHour > 0 ? `${totalHour.toFixed(2)} hrs` : "-";
                return {
                    day: d.day,
                    date: d.date,
                    status: "P",
                    label: totalHrs,
                    totalHour,
                    startTime,
                    endTime,
                    attendanceid: record.attendanceid,
                    ismanual: record.ismanual,
                    checkIns: checkInDets.map((d) => ({
                        attendancedetid: d.attendancedetid,
                        attendancetime: d.attendancetime,
                        attendancesourcetypecd: record.attendancesourcetypecd,
                    })),
                    checkOuts: checkOutDets.map((d) => ({
                        attendancedetid: d.attendancedetid,
                        attendancetime: d.attendancetime,
                        attendancesourcetypecd: record.attendancesourcetypecd,
                    })),
                };
            });
            return {
                employeeid: emp.employeeid,
                employeename: emp.employeename,
                departmentname: emp.hrm_department?.departmentname ?? null,
                monthlyTotalHour: parseFloat(monthlyTotalHour.toFixed(2)),
                days: dailyStatus,
            };
        });
        this.logger.log(`GetMonthlyGrid completed | employees=${employeeRows.length}, days=${daysInMonth}, totalCount=${totalCount}`);
        return {
            month,
            year,
            totalCount,
            days,
            employees: employeeRows,
        };
    }
    buildDayHeaders(year, month, daysInMonth) {
        return Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const date = new Date(Date.UTC(year, month - 1, dayNum));
            return {
                day: dayNum,
                date: date.toISOString().split("T")[0],
                dayName: date.toLocaleDateString("en-US", {
                    weekday: "long",
                    timeZone: "UTC",
                }),
                dayShort: date.toLocaleDateString("en-US", {
                    weekday: "short",
                    timeZone: "UTC",
                }),
            };
        });
    }
    getCurrentUaeTime() {
        const now = new Date();
        const uaeOffsetMs = 4 * 60 * 60 * 1000;
        const uaeDate = new Date(now.getTime() + uaeOffsetMs);
        const h = String(uaeDate.getUTCHours()).padStart(2, '0');
        const m = String(uaeDate.getUTCMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }
    buildTime(dateStr, timeStr) {
        const t = timeStr.length === 5 ? timeStr + ":00" : timeStr;
        return new Date(`${dateStr}T${t}.000Z`);
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = AttendanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetByDateDto } from "./dto/get-by-date.dto";
import { SaveByDateDto } from "./dto/save-by-date.dto";
import { MonthlyGridDto } from "./dto/monthly-grid.dto";
import { ATTENDANCE_SOURCE_MOBILE } from "./dto/save-by-date.dto";

// typeid 1 = Check-in, typeid 2 = Check-out
const TYPE_CHECKIN = 1;
const TYPE_CHECKOUT = 2;

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── GetByDate ────────────────────────────────────────────────────────────────
  // Called when user clicks a cell in the grid → opens the popup modal
  // Mirrors .NET: GetEmployeeAttByDate — returns first check-in + last check-out

  async getByDate(dto: GetByDateDto, companyId: number) {
    this.logger.log(
      `GetByDate started | employeeId=${dto.employeeId}, date=${dto.date}`,
    );

    const startOfDay = new Date(`${dto.date}T00:00:00.000`);
    const endOfDay = new Date(`${dto.date}T23:59:59.999`);

    // Fetch employee + department info
    const employee = await this.prisma.hrm_employee.findUnique({
      where: { employeeid: dto.employeeId },
      select: {
        employeeid: true,
        employeename: true,
        departmentid: true,
        hrm_department: { select: { departmentname: true } },
      },
    });

    if (!employee) throw new NotFoundException("Employee not found");

    // Fetch attendance record for the day (including all det rows)
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

    // Mirror .NET logic: first check-in (by ID asc) + last check-out (by ID desc)
    // But still return as arrays so front-end can show web vs mobile entries
    const allCheckIns = det
      .filter((d) => d.typeid === TYPE_CHECKIN)
      .sort((a, b) => a.attendancedetid - b.attendancedetid);

    const allCheckOuts = det
      .filter((d) => d.typeid === TYPE_CHECKOUT)
      .sort((a, b) => b.attendancedetid - a.attendancedetid);

    const formatDet = (d: (typeof det)[0]) => ({
      attendancedetid: d.attendancedetid,
      attendancetime: d.attendancetime,
      attendancesourcetypecd: attendance?.attendancesourcetypecd ?? null,
      notes: d.notes1,
    });

    this.logger.log(
      `GetByDate completed | attendanceid=${attendance?.attendanceid ?? "none"}`,
    );

    return {
      attendanceid: attendance?.attendanceid ?? null,
      attendancedate: dto.date,
      employeeid: employee.employeeid,
      employeename: employee.employeename,
      departmentname: employee.hrm_department?.departmentname ?? null,
      totalhour: attendance?.totalhour ?? null,
      ismanual: attendance?.ismanual ?? false,
      notes: attendance?.notes1 ?? null,
      // Full arrays so front-end can display all source types (web/mobile)
      checkIns: allCheckIns.map(formatDet),
      checkOuts: allCheckOuts.map(formatDet),
    };
  }

  // ─── SaveByDate ───────────────────────────────────────────────────────────────
  // Called when user clicks "Update" in the modal
  // Mirrors .NET: SaveEmployeeAttByDate with array-based structure

  async saveByDate(dto: SaveByDateDto, currentId: number, companyId: number) {
    this.logger.log(
      `SaveByDate started | employeeId=${dto.employeeId}, date=${dto.attendanceDate}`,
    );

    // Validate employee exists to prevent foreign key constraint violations
    const employee = await this.prisma.hrm_employee.findUnique({
      where: { employeeid: dto.employeeId },
      select: { employeeid: true },
    });

    if (!employee) {
      this.logger.warn(`SaveByDate failed | Employee ID ${dto.employeeId} not found in database.`);
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }

    // DTO date might be '2026-06-02T00:00:00', we take the YYYY-MM-DD part
    const dateOnly = dto.attendanceDate.split("T")[0];
    const startOfDay = new Date(`${dateOnly}T00:00:00.000`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999`);

    const detList = dto.attendanceDetDTOList || [];

    // For mobile attendance — time is captured as current UAE time, not from the request
    if (dto.attendanceSourceTypeCd === ATTENDANCE_SOURCE_MOBILE) {
      const uaeNow = this.getCurrentUaeTime();
      this.logger.log(`Mobile attendance — using UAE server time: ${uaeNow}`);
      // Apply UAE time to all det items
      for (const item of detList) {
        item.attTime = uaeNow;
      }
    }

    // Find existing attendance header for this employee + date
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

    let effectiveCheckIn: string | null = null;
    let effectiveCheckOut: string | null = null;

    // We need to figure out check-in and check-out to calculate total hours
    const checkInDet = detList.find((d) => d.typeId === TYPE_CHECKIN);
    const checkOutDet = detList.find((d) => d.typeId === TYPE_CHECKOUT);

    if (existing) {
      // Get first check-in from existing det rows (as HH:mm string)
      const existingCheckIn = existing.hrm_attendancedet
        .filter((d) => d.typeid === TYPE_CHECKIN)
        .sort((a, b) => a.attendancedetid - b.attendancedetid)[0];

      if (existingCheckIn?.attendancetime) {
        const t = existingCheckIn.attendancetime as Date;
        effectiveCheckIn = `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}`;
      }

      if (checkInDet?.attTime) effectiveCheckIn = checkInDet.attTime;
      if (checkOutDet?.attTime) effectiveCheckOut = checkOutDet.attTime;
    } else {
      if (checkInDet?.attTime) effectiveCheckIn = checkInDet.attTime;
      if (checkOutDet?.attTime) effectiveCheckOut = checkOutDet.attTime;
    }

    // ── Total Hours Calculation (mirrors .NET exactly) ─────────────────────────
    let totalHour: number = 0;

    if (effectiveCheckIn && effectiveCheckOut) {
      const [inH, inM] = effectiveCheckIn.split(":").map(Number);
      const [outH, outM] = effectiveCheckOut.split(":").map(Number);

      const checkInMs = inH * 60 + inM;
      const checkOutMs = outH * 60 + outM;

      if (checkOutMs < checkInMs) {
        throw new BadRequestException(
          "Check-out time cannot be earlier than check-in time.",
        );
      }

      const diffMinutes = checkOutMs - checkInMs;
      const totalHoursInt = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      totalHour = parseFloat(
        (totalHoursInt + remainingMinutes / 60).toFixed(2),
      );
    }

    // ── Upsert attendance header ───────────────────────────────────────────────
    let attendanceid: number;

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

      // Soft-delete det rows before re-inserting
      // Mirroring .NET UpdateData logic
      await this.prisma.hrm_attendancedet.updateMany({
        where: { attendanceid, isdeleted: false, createby: currentId },
        data: { isdeleted: true, deleteby: currentId, deletedate: new Date() },
      });
    } else {
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

    // ── Insert det rows from payload ──────────────────────────────────────────
    const detRows: any[] = [];

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

  // ─── GetMonthlyGrid ───────────────────────────────────────────────────────────
  // Mirrors .NET: GetEmployeeAttDetailByMonth
  //
  // Key .NET logic preserved:
  //  1. Weekend detection from employee.holiday field (comma-separated day names)
  //  2. Per-day: startTime (first check-in), endTime (last check-out), totalHour
  //  3. monthlyTotalHour per employee
  //  4. Supports search, pagination (offset/limit), totalCount
  //  5. Per-employee department name

  async getMonthlyGrid(dto: MonthlyGridDto, companyId: number) {
    const {
      month,
      year,
      departmentId,
      employeeId,
      search = "",
      offset = 0,
      limit = 10,
    } = dto;

    this.logger.log(
      `GetMonthlyGrid started | month=${month}, year=${year}, companyId=${companyId}`,
    );

    // Build date range for the whole month
    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const daysInMonth = lastDay.getUTCDate();

    // Build employee filter (mirrors .NET SQL query)
    const employeeWhere: any = {
      // isdeleted: false,
      companyid: companyId,
      isactive: true,
    };
    if (departmentId) employeeWhere.departmentid = departmentId;
    if (employeeId) employeeWhere.employeeid = employeeId;
    if (search) {
      employeeWhere.employeename = { contains: search };
    }

    // Total count for pagination
    const totalCount = await this.prisma.hrm_employee.count({
      where: employeeWhere,
    });

    // Fetch paginated employees with department name
    const employees = await this.prisma.hrm_employee.findMany({
      where: employeeWhere,
      select: {
        employeeid: true,
        employeename: true,
        departmentid: true,
        holiday: true, // e.g. "Saturday,Sunday" — mirrors .NET employee.Holiday
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

    // Fetch all attendance records for those employees in the month (one query)
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

    // Build map: employeeid → Map<dayOfMonth, record>
    const attendanceMap = new Map<
      number,
      Map<number, (typeof attendanceRecords)[0]>
    >();
    for (const record of attendanceRecords) {
      const empId = record.employeeid;
      const day = new Date(record.attendancedate!).getUTCDate();
      if (!attendanceMap.has(empId)) attendanceMap.set(empId, new Map());
      attendanceMap.get(empId)!.set(day, record);
    }

    // Column headers
    const days = this.buildDayHeaders(year, month, daysInMonth);

    // Build per-employee rows (mirrors .NET foreach employee + foreach day loop)
    const employeeRows = employees.map((emp) => {
      // Mirror .NET: parse employee.holiday as comma-separated day names
      // e.g. "Saturday,Sunday" → ['saturday', 'sunday']
      const weekendDays = (emp.holiday ?? "Saturday,Sunday")
        .split(",")
        .map((d) => d.trim().toLowerCase());

      const empAttendance = attendanceMap.get(emp.employeeid);
      let monthlyTotalHour = 0;

      const dailyStatus = days.map((d) => {
        // Mirror .NET: check if this day's name is in the employee's weekend list
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

        // Mirror .NET: first check-in (startTime), last check-out (endTime)
        const checkInDets = det
          .filter((d) => d.typeid === TYPE_CHECKIN)
          .sort((a, b) => a.attendancedetid - b.attendancedetid);
        const checkOutDets = det
          .filter((d) => d.typeid === TYPE_CHECKOUT)
          .sort((a, b) => b.attendancedetid - a.attendancedetid);

        const startTime = checkInDets[0]?.attendancetime ?? null;
        const endTime = checkOutDets[0]?.attendancetime ?? null;

        // Mirror .NET: totalHours from check-in + check-out time diff
        let totalHour = 0;
        if (startTime && endTime) {
          const inDate = new Date(startTime as unknown as string);
          const outDate = new Date(endTime as unknown as string);
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

    this.logger.log(
      `GetMonthlyGrid completed | employees=${employeeRows.length}, days=${daysInMonth}, totalCount=${totalCount}`,
    );

    return {
      month,
      year,
      totalCount,
      days,
      employees: employeeRows,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  // Build column header array for the calendar grid
  private buildDayHeaders(year: number, month: number, daysInMonth: number) {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const date = new Date(Date.UTC(year, month - 1, dayNum));
      return {
        day: dayNum,
        date: date.toISOString().split("T")[0],
        // Full day name so we can match against employee.holiday string
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

  // Mirror .NET: get current time in UAE/Dubai timezone as HH:mm string
  private getCurrentUaeTime(): string {
    const now = new Date();
    // UAE is UTC+4 (no DST)
    const uaeOffsetMs = 4 * 60 * 60 * 1000;
    const uaeDate = new Date(now.getTime() + uaeOffsetMs);
    const h = String(uaeDate.getUTCHours()).padStart(2, '0');
    const m = String(uaeDate.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // Build a UTC Date from a YYYY-MM-DD date string + HH:mm time string
  private buildTime(dateStr: string, timeStr: string): Date {
    const t = timeStr.length === 5 ? timeStr + ":00" : timeStr;
    return new Date(`${dateStr}T${t}.000Z`);
  }
}

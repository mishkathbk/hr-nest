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
var PayrollGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollGenerationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const SALARY_CATEGORY_ADDITION = 4400001;
const SALARY_CATEGORY_DEDUCTION = 4400002;
const SALARY_CODE_NOT = "NOT";
const SALARY_CODE_HOT = "HOT";
const SALARY_CODE_ABSENT = "ABSENT";
let PayrollGenerationService = PayrollGenerationService_1 = class PayrollGenerationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PayrollGenerationService_1.name);
    }
    async calculateSalary(dto, companyId, currentId) {
        this.logger.log(`CalculateSalary started | year=${dto.year}, month=${dto.month}, companyId=${companyId}, employeeId=${dto.employeeId ?? "ALL"}`);
        const startDate = new Date(Date.UTC(dto.year, dto.month - 1, 1));
        const endDate = new Date(Date.UTC(dto.year, dto.month, 0, 23, 59, 59, 999));
        const employees = await this.prisma.hrm_employee.findMany({
            where: {
                companyid: companyId,
                isactive: true,
                ...(dto.employeeId ? { employeeid: dto.employeeId } : {}),
            },
            select: {
                employeeid: true,
                employeename: true,
                isot: true,
                holiday: true,
            },
        });
        if (employees.length === 0) {
            throw new common_1.NotFoundException("No active employees found for this filter");
        }
        const specialSalaryTypes = await this.prisma.hrm_salarytype.findMany({
            where: {
                companyid: companyId,
                salarytypecode: {
                    in: [SALARY_CODE_NOT, SALARY_CODE_HOT, SALARY_CODE_ABSENT],
                },
            },
            select: { salarytypeid: true, salarytypecode: true },
        });
        const salaryTypeMap = new Map(specialSalaryTypes.map((s) => [s.salarytypecode, s.salarytypeid]));
        const processed = [];
        const skipped = [];
        for (const emp of employees) {
            const empId = emp.employeeid;
            const existingApproved = await this.prisma.hrm_payrollgeneration.findFirst({
                where: {
                    companyid: companyId,
                    employeeid: empId,
                    payrollyear: dto.year,
                    payrollmonth: dto.month,
                    isapprove: true,
                },
            });
            if (existingApproved) {
                this.logger.log(`Skip employee ${empId} — already approved`);
                skipped.push(empId);
                continue;
            }
            const empSalary = await this.prisma.hrm_employeesalary.findFirst({
                where: {
                    employeeid: empId,
                    datefrom: { lte: startDate },
                },
                orderBy: { datefrom: "desc" },
                include: {
                    hrm_employeesalarydet: {
                        include: { hrm_salarytype: true },
                    },
                },
            });
            const totalSalary = Number(empSalary?.totalsalary ?? 0);
            if (totalSalary === 0) {
                this.logger.log(`Skip employee ${empId} — no salary configured`);
                skipped.push(empId);
                continue;
            }
            const daySalary = Math.round((totalSalary / 30) * 100) / 100;
            const notRate = Math.round((totalSalary / 30 / 8) * 1.25 * 100) / 100;
            const hotRate = Math.round((totalSalary / 30 / 8) * 1.5 * 100) / 100;
            const existing = await this.prisma.hrm_payrollgeneration.findFirst({
                where: {
                    companyid: companyId,
                    employeeid: empId,
                    payrollyear: dto.year,
                    payrollmonth: dto.month,
                },
            });
            if (existing) {
                await this.prisma.hrm_payrollgenerationdet.deleteMany({
                    where: { payrollgenerationid: existing.payrollgenerationid },
                });
                await this.prisma.hrm_payrollgeneration.delete({
                    where: { payrollgenerationid: existing.payrollgenerationid },
                });
            }
            const payrollHeader = await this.prisma.hrm_payrollgeneration.create({
                data: {
                    employeeid: empId,
                    payrollyear: dto.year,
                    payrollmonth: dto.month,
                    isapprove: false,
                    companyid: companyId,
                    isactive: true,
                    createdby: currentId,
                    createddate: new Date(),
                    isdeleted: false,
                },
            });
            const pgId = payrollHeader.payrollgenerationid;
            const detRows = [];
            if (empSalary?.hrm_employeesalarydet) {
                for (const det of empSalary.hrm_employeesalarydet) {
                    const amount = Number(det.amount ?? 0);
                    if (amount <= 0)
                        continue;
                    const categoryCode = det.hrm_salarytype?.salarytypecategorycd;
                    detRows.push({
                        payrollgenerationid: pgId,
                        salarytypeid: det.salarytypeid,
                        addamount: categoryCode === SALARY_CATEGORY_ADDITION ? amount : 0,
                        dedamount: categoryCode === SALARY_CATEGORY_DEDUCTION ? amount : 0,
                        companyid: companyId,
                        isactive: true,
                        isdeleted: false,
                        createdby: currentId,
                        createddate: new Date(),
                    });
                }
            }
            const salaryAdjustments = await this.prisma.hrm_salaryadjustment.findMany({
                where: {
                    employeeid: empId,
                    companyid: companyId,
                    payrollyear: dto.year,
                    payrollmonth: dto.month,
                    isdeleted: { not: true },
                },
                include: {
                    hrm_salarytype: {
                        select: { salarytypecategorycd: true },
                    },
                },
            });
            for (const adj of salaryAdjustments) {
                const amount = Number(adj.amount ?? 0);
                if (amount <= 0)
                    continue;
                const categoryCode = adj.hrm_salarytype?.salarytypecategorycd;
                detRows.push({
                    payrollgenerationid: pgId,
                    salarytypeid: adj.salarytypeid,
                    addamount: categoryCode === SALARY_CATEGORY_ADDITION ? amount : 0,
                    dedamount: categoryCode === SALARY_CATEGORY_DEDUCTION ? amount : 0,
                    notes1: adj.remarks ?? null,
                    companyid: companyId,
                    isactive: true,
                    isdeleted: false,
                    createdby: currentId,
                    createddate: new Date(),
                });
            }
            const attendanceSummary = await this.getAttendanceSummary(empId, companyId, startDate, endDate, emp.holiday);
            if (emp.isot) {
                const notTypeId = salaryTypeMap.get(SALARY_CODE_NOT);
                const hotTypeId = salaryTypeMap.get(SALARY_CODE_HOT);
                if (attendanceSummary.normalOTHours > 0 && notTypeId) {
                    const notAmount = Math.round(attendanceSummary.normalOTHours * notRate * 100) / 100;
                    detRows.push({
                        payrollgenerationid: pgId,
                        salarytypeid: notTypeId,
                        addamount: notAmount,
                        dedamount: 0,
                        notes1: `Total NOT Hours: ${attendanceSummary.normalOTHours}`,
                        companyid: companyId,
                        isactive: true,
                        isdeleted: false,
                        createdby: currentId,
                        createddate: new Date(),
                    });
                }
                if (attendanceSummary.holidayOTHours > 0 && hotTypeId) {
                    const hotAmount = Math.round(attendanceSummary.holidayOTHours * hotRate * 100) / 100;
                    detRows.push({
                        payrollgenerationid: pgId,
                        salarytypeid: hotTypeId,
                        addamount: hotAmount,
                        dedamount: 0,
                        notes1: `Total HOT Hours: ${attendanceSummary.holidayOTHours}`,
                        companyid: companyId,
                        isactive: true,
                        isdeleted: false,
                        createdby: currentId,
                        createddate: new Date(),
                    });
                }
            }
            const absentTypeId = salaryTypeMap.get(SALARY_CODE_ABSENT);
            const totalAbsent = attendanceSummary.absentDays + attendanceSummary.unpaidLeaveDays;
            if (totalAbsent > 0 && absentTypeId) {
                const absentDeduction = Math.round(totalAbsent * daySalary * 100) / 100;
                detRows.push({
                    payrollgenerationid: pgId,
                    salarytypeid: absentTypeId,
                    addamount: 0,
                    dedamount: absentDeduction,
                    notes1: `Total Absent: ${totalAbsent}`,
                    companyid: companyId,
                    isactive: true,
                    isdeleted: false,
                    createdby: currentId,
                    createddate: new Date(),
                });
            }
            if (detRows.length > 0) {
                await this.prisma.hrm_payrollgenerationdet.createMany({
                    data: detRows,
                });
            }
            const allDet = await this.prisma.hrm_payrollgenerationdet.findMany({
                where: { payrollgenerationid: pgId, isdeleted: { not: true } },
            });
            const totalAmount = allDet.reduce((sum, d) => sum + Number(d.addamount ?? 0) - Number(d.dedamount ?? 0), 0);
            await this.prisma.hrm_payrollgeneration.update({
                where: { payrollgenerationid: pgId },
                data: {
                    totalamount: Math.round(totalAmount * 10000) / 10000,
                    totalhours: attendanceSummary.totalHours,
                    totaldays: attendanceSummary.presentDays,
                    modifiedby: currentId,
                    modifieddate: new Date(),
                },
            });
            processed.push(empId);
            this.logger.log(`Processed employee ${empId} | pgId=${pgId}, totalAmount=${totalAmount}`);
        }
        this.logger.log(`CalculateSalary completed | processed=${processed.length}, skipped=${skipped.length}`);
        return {
            processed: processed.length,
            skipped: skipped.length,
            processedEmployeeIds: processed,
            skippedEmployeeIds: skipped,
        };
    }
    async getPayrollList(dto, companyId) {
        this.logger.log(`GetPayrollList started | year=${dto.year}, month=${dto.month}, companyId=${companyId}`);
        const where = {
            companyid: companyId,
            payrollyear: dto.year,
            payrollmonth: dto.month,
            isdeleted: false,
        };
        if (dto.employeeId)
            where.employeeid = dto.employeeId;
        const records = await this.prisma.hrm_payrollgeneration.findMany({
            where,
            include: {
                hrm_payrollgenerationdet: {
                    where: { isdeleted: false },
                },
            },
            orderBy: { payrollgenerationid: "asc" },
        });
        const employeeIds = records.map((r) => r.employeeid);
        const employees = await this.prisma.hrm_employee.findMany({
            where: { employeeid: { in: employeeIds } },
            select: {
                employeeid: true,
                employeename: true,
                employeecode: true,
                hrm_department: { select: { departmentname: true } },
                hrm_designation: { select: { designationname: true } },
            },
        });
        const empMap = new Map(employees.map((e) => [e.employeeid, e]));
        let totalAdditions = 0;
        let totalDeductions = 0;
        const rows = records.map((r) => {
            const emp = empMap.get(r.employeeid);
            const additions = r.hrm_payrollgenerationdet.reduce((sum, d) => sum + Number(d.addamount ?? 0), 0);
            const deductions = r.hrm_payrollgenerationdet.reduce((sum, d) => sum + Number(d.dedamount ?? 0), 0);
            const netAmount = additions - deductions;
            totalAdditions += additions;
            totalDeductions += deductions;
            return {
                payrollgenerationid: r.payrollgenerationid,
                employeeid: r.employeeid,
                employeecode: emp?.employeecode ?? null,
                employeename: emp?.employeename ?? null,
                departmentname: emp?.hrm_department?.departmentname ?? null,
                designationname: emp?.hrm_designation?.designationname ?? null,
                payrollyear: r.payrollyear,
                payrollmonth: r.payrollmonth,
                additions: Math.round(additions * 100) / 100,
                deductions: Math.round(deductions * 100) / 100,
                totalamount: Math.round(netAmount * 100) / 100,
                totaldays: r.totaldays ? Number(r.totaldays) : null,
                totalhours: r.totalhours ? Number(r.totalhours) : null,
                isapprove: r.isapprove,
                approvedby: r.approvedby,
                approveddate: r.approveddate,
            };
        });
        this.logger.log(`GetPayrollList completed | records=${rows.length}`);
        return {
            year: dto.year,
            month: dto.month,
            rows,
            summary: {
                totalEmployees: rows.length,
                totalAdditions: Math.round(totalAdditions * 100) / 100,
                totalDeductions: Math.round(totalDeductions * 100) / 100,
                totalPayable: Math.round((totalAdditions - totalDeductions) * 100) / 100,
            },
        };
    }
    async generatePayroll(dto, companyId, currentId) {
        this.logger.log(`GeneratePayroll started | ids=${dto.payrollGenerationIds.join(",")}, companyId=${companyId}`);
        const records = await this.prisma.hrm_payrollgeneration.findMany({
            where: {
                payrollgenerationid: { in: dto.payrollGenerationIds },
                companyid: companyId,
            },
        });
        if (records.length !== dto.payrollGenerationIds.length) {
            throw new common_1.BadRequestException("One or more payroll records not found or do not belong to your company");
        }
        const alreadyApproved = records.filter((r) => r.isapprove);
        if (alreadyApproved.length > 0) {
            throw new common_1.BadRequestException(`Records already approved: ${alreadyApproved.map((r) => r.payrollgenerationid).join(", ")}`);
        }
        const result = await this.prisma.hrm_payrollgeneration.updateMany({
            where: {
                payrollgenerationid: { in: dto.payrollGenerationIds },
                companyid: companyId,
                isapprove: false,
            },
            data: {
                isapprove: true,
                approvedby: currentId,
                approveddate: new Date(),
                modifiedby: currentId,
                modifieddate: new Date(),
            },
        });
        this.logger.log(`GeneratePayroll completed | approved=${result.count}`);
        return {
            approved: result.count,
            payrollGenerationIds: dto.payrollGenerationIds,
        };
    }
    async getPayrollDetail(payrollGenerationId, companyId) {
        this.logger.log(`GetPayrollDetail started | payrollGenerationId=${payrollGenerationId}`);
        const header = await this.prisma.hrm_payrollgeneration.findFirst({
            where: {
                payrollgenerationid: payrollGenerationId,
                companyid: companyId,
            },
        });
        if (!header)
            throw new common_1.NotFoundException("Payroll record not found");
        const det = await this.prisma.hrm_payrollgenerationdet.findMany({
            where: {
                payrollgenerationid: payrollGenerationId,
                isdeleted: false,
            },
            orderBy: { payrollgenerationdetid: "asc" },
        });
        const salaryTypeIds = [...new Set(det.map((d) => d.salarytypeid))];
        const salaryTypes = await this.prisma.hrm_salarytype.findMany({
            where: { salarytypeid: { in: salaryTypeIds } },
            select: {
                salarytypeid: true,
                salarytypecode: true,
                salarytypename: true,
                salarytypecategorycd: true,
            },
        });
        const stMap = new Map(salaryTypes.map((s) => [s.salarytypeid, s]));
        const emp = await this.prisma.hrm_employee.findUnique({
            where: { employeeid: header.employeeid },
            select: {
                employeeid: true,
                employeecode: true,
                employeename: true,
                hrm_department: { select: { departmentname: true } },
                hrm_designation: { select: { designationname: true } },
            },
        });
        const additions = det
            .filter((d) => Number(d.addamount ?? 0) > 0)
            .map((d) => ({
            payrollgenerationdetid: d.payrollgenerationdetid,
            salarytypeid: d.salarytypeid,
            salarytypecode: stMap.get(d.salarytypeid)?.salarytypecode ?? null,
            salarytypename: stMap.get(d.salarytypeid)?.salarytypename ?? null,
            amount: Number(d.addamount ?? 0),
            notes: d.notes1,
        }));
        const deductions = det
            .filter((d) => Number(d.dedamount ?? 0) > 0)
            .map((d) => ({
            payrollgenerationdetid: d.payrollgenerationdetid,
            salarytypeid: d.salarytypeid,
            salarytypecode: stMap.get(d.salarytypeid)?.salarytypecode ?? null,
            salarytypename: stMap.get(d.salarytypeid)?.salarytypename ?? null,
            amount: Number(d.dedamount ?? 0),
            notes: d.notes1,
        }));
        const totalAdditions = additions.reduce((s, d) => s + d.amount, 0);
        const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
        this.logger.log(`GetPayrollDetail completed | payrollGenerationId=${payrollGenerationId}`);
        return {
            payrollgenerationid: header.payrollgenerationid,
            employee: emp,
            payrollyear: header.payrollyear,
            payrollmonth: header.payrollmonth,
            totaldays: header.totaldays ? Number(header.totaldays) : null,
            totalhours: header.totalhours ? Number(header.totalhours) : null,
            totalamount: header.totalamount ? Number(header.totalamount) : null,
            isapprove: header.isapprove,
            approvedby: header.approvedby,
            approveddate: header.approveddate,
            additions,
            deductions,
            summary: {
                totalAdditions: Math.round(totalAdditions * 100) / 100,
                totalDeductions: Math.round(totalDeductions * 100) / 100,
                netPayable: Math.round((totalAdditions - totalDeductions) * 100) / 100,
            },
        };
    }
    async getAttendanceSummary(employeeId, companyId, startDate, endDate, holidayStr) {
        const weekendDays = new Set((holidayStr ?? "Saturday,Sunday")
            .split(",")
            .map((d) => d.trim().toLowerCase()));
        const daysInMonth = endDate.getUTCDate();
        let presentDays = 0;
        let absentDays = 0;
        const unpaidLeaveDays = 0;
        let totalHours = 0;
        const normalOTHours = 0;
        const holidayOTHours = 0;
        const attendanceRecords = await this.prisma.hrm_attendance.findMany({
            where: {
                employeeid: employeeId,
                companyid: companyId,
                isdeleted: false,
                attendancedate: { gte: startDate, lte: endDate },
            },
            select: {
                attendancedate: true,
                totalhour: true,
            },
        });
        const attendanceDayMap = new Map();
        for (const rec of attendanceRecords) {
            const day = new Date(rec.attendancedate).getUTCDate();
            attendanceDayMap.set(day, Number(rec.totalhour ?? 0));
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), d));
            const dayName = date
                .toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
                .toLowerCase();
            if (weekendDays.has(dayName))
                continue;
            if (attendanceDayMap.has(d)) {
                presentDays++;
                totalHours += attendanceDayMap.get(d);
            }
            else {
                absentDays++;
            }
        }
        return {
            presentDays,
            absentDays,
            unpaidLeaveDays,
            totalHours: Math.round(totalHours * 100) / 100,
            normalOTHours,
            holidayOTHours,
        };
    }
};
exports.PayrollGenerationService = PayrollGenerationService;
exports.PayrollGenerationService = PayrollGenerationService = PayrollGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollGenerationService);
//# sourceMappingURL=payroll-generation.service.js.map
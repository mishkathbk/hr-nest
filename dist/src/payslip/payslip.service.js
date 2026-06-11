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
var PayslipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayslipService = PayslipService_1 = class PayslipService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PayslipService_1.name);
    }
    async getMyPayslipList(employeeId, companyId, dto) {
        this.logger.log(`GetMyPayslipList | employeeId=${employeeId}, companyId=${companyId}`);
        const records = await this.prisma.hrm_payrollgeneration.findMany({
            where: {
                employeeid: employeeId,
                companyid: companyId,
                isapprove: true,
                isdeleted: { not: true },
                ...(dto.year ? { payrollyear: dto.year } : {}),
                ...(dto.month ? { payrollmonth: dto.month } : {}),
            },
            include: {
                hrm_payrollgenerationdet: {
                    where: { isdeleted: { not: true } },
                },
            },
            orderBy: [{ payrollyear: "desc" }, { payrollmonth: "desc" }],
        });
        const rows = records.map((r) => {
            const additions = r.hrm_payrollgenerationdet.reduce((sum, d) => sum + Number(d.addamount ?? 0), 0);
            const deductions = r.hrm_payrollgenerationdet.reduce((sum, d) => sum + Number(d.dedamount ?? 0), 0);
            return {
                payrollgenerationid: r.payrollgenerationid,
                payrollyear: r.payrollyear,
                payrollmonth: r.payrollmonth,
                additions: Math.round(additions * 100) / 100,
                deductions: Math.round(deductions * 100) / 100,
                totalamount: Math.round((additions - deductions) * 100) / 100,
            };
        });
        return { rows };
    }
    async getMyPayslipDetail(payrollGenerationId, employeeId, companyId) {
        this.logger.log(`GetMyPayslipDetail | payrollGenerationId=${payrollGenerationId}, employeeId=${employeeId}`);
        const header = await this.prisma.hrm_payrollgeneration.findFirst({
            where: {
                payrollgenerationid: payrollGenerationId,
                employeeid: employeeId,
                companyid: companyId,
                isapprove: true,
                isdeleted: { not: true },
            },
        });
        if (!header)
            throw new common_1.NotFoundException("Payslip not found");
        const det = await this.prisma.hrm_payrollgenerationdet.findMany({
            where: {
                payrollgenerationid: payrollGenerationId,
                isdeleted: { not: true },
            },
            orderBy: { payrollgenerationdetid: "asc" },
        });
        const salaryTypeIds = [...new Set(det.map((d) => d.salarytypeid))];
        const salaryTypes = await this.prisma.hrm_salarytype.findMany({
            where: { salarytypeid: { in: salaryTypeIds } },
            select: {
                salarytypeid: true,
                salarytypename: true,
                salarytypecategorycd: true,
            },
        });
        const stMap = new Map(salaryTypes.map((s) => [s.salarytypeid, s]));
        const emp = await this.prisma.hrm_employee.findUnique({
            where: { employeeid: employeeId },
            select: {
                employeename: true,
                employeecode: true,
                hrm_department: { select: { departmentname: true } },
                hrm_designation: { select: { designationname: true } },
            },
        });
        const lines = det.map((d) => {
            const st = stMap.get(d.salarytypeid);
            const addamount = Number(d.addamount ?? 0);
            const dedamount = Number(d.dedamount ?? 0);
            return {
                payrollgenerationdetid: d.payrollgenerationdetid,
                salarytypename: st?.salarytypename ?? null,
                addamount: addamount > 0 ? addamount : null,
                dedamount: dedamount > 0 ? dedamount : null,
                notes: d.notes1 ?? null,
            };
        });
        const totalAdditions = det.reduce((s, d) => s + Number(d.addamount ?? 0), 0);
        const totalDeductions = det.reduce((s, d) => s + Number(d.dedamount ?? 0), 0);
        return {
            payrollgenerationid: header.payrollgenerationid,
            payrollyear: header.payrollyear,
            payrollmonth: header.payrollmonth,
            employee: emp,
            lines,
            summary: {
                totalAdditions: Math.round(totalAdditions * 100) / 100,
                totalDeductions: Math.round(totalDeductions * 100) / 100,
                netPayable: Math.round((totalAdditions - totalDeductions) * 100) / 100,
            },
        };
    }
};
exports.PayslipService = PayslipService;
exports.PayslipService = PayslipService = PayslipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayslipService);
//# sourceMappingURL=payslip.service.js.map
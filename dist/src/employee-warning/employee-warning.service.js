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
var EmployeeWarningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeWarningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const status_constants_1 = require("../common/constants/status.constants");
let EmployeeWarningService = EmployeeWarningService_1 = class EmployeeWarningService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EmployeeWarningService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
        const record = await this.prisma.hrm_employeewarning.findUnique({
            where: { employeewarningid: id },
        });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        const withEmployee = await this.attachEmployeeNames([record]);
        this.logger.log(`GetByKey completed | id=${id}`);
        return withEmployee[0];
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
        const record = await this.prisma.hrm_employeewarning.create({
            data: {
                employeeid: dto.employeeId,
                subject: dto.subject ?? null,
                warningmessage: dto.warningMessage ?? null,
                statuscd: dto.statusCd ?? status_constants_1.STATUS_ACTIVE,
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
    async updateData(id, dto, currentId, companyId) {
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
        if (!updated)
            throw new common_1.NotFoundException('Update failed or record not found');
        this.logger.log(`UpdateData completed | id=${id}`);
        return updated;
    }
    async deleteData(id, currentId) {
        this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);
        const updated = await this.prisma.hrm_employeewarning.update({
            where: { employeewarningid: id },
            data: {
                isdeleted: true,
                deleteby: currentId,
                deletedate: new Date(),
            },
        });
        if (!updated)
            throw new common_1.NotFoundException('Record not found');
        this.logger.log(`DeleteData completed | id=${id}`);
        return { deleted: true };
    }
    async list(companyId, isInactiveLoad = false) {
        this.logger.log(`List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`);
        const where = {
            isdeleted: false,
            companyid: companyId,
        };
        if (!isInactiveLoad) {
            where.statuscd = status_constants_1.STATUS_ACTIVE;
        }
        const records = await this.prisma.hrm_employeewarning.findMany({
            where,
            orderBy: { createddate: 'desc' },
        });
        this.logger.log(`List completed | count=${records.length}`);
        return await this.attachEmployeeNames(records);
    }
    async listPagination(dto, companyId) {
        const { search = '', filters = [], pageNumber = 1, pageSize = 10, sortBy = 'employeewarningid', isDescending = true, } = dto;
        const skip = (pageNumber - 1) * pageSize;
        this.logger.log(`ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`);
        const where = { isdeleted: false, companyid: companyId };
        if (search?.trim()) {
            where.OR = [
                { subject: { contains: search } },
                { warningmessage: { contains: search } },
            ];
        }
        if (filters?.length > 0) {
            for (const item of filters) {
                const fieldName = item.attributeName;
                const rawValue = item.attributeValue;
                if (rawValue === 'true' || rawValue === 'false') {
                    where[fieldName] = rawValue === 'true';
                }
                else if (!isNaN(Number(rawValue)) && rawValue.trim() !== '') {
                    where[fieldName] = Number(rawValue);
                }
                else if (!isNaN(Date.parse(rawValue))) {
                    where[fieldName] = new Date(rawValue);
                }
                else {
                    where[fieldName] = { contains: rawValue };
                }
            }
        }
        const orderBy = { [sortBy]: isDescending ? 'desc' : 'asc' };
        const [records, totalCount] = await this.prisma.$transaction([
            this.prisma.hrm_employeewarning.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
            }),
            this.prisma.hrm_employeewarning.count({ where }),
        ]);
        const recordsWithEmployeeNames = await this.attachEmployeeNames(records);
        this.logger.log(`ListPagination completed | count=${records.length}, totalCount=${totalCount}`);
        return new response_interceptor_1.PaginatedResult(recordsWithEmployeeNames, totalCount);
    }
    async attachEmployeeNames(records) {
        if (!records || records.length === 0)
            return records;
        const employeeIds = [...new Set(records.map((r) => r.employeeid).filter(Boolean))];
        if (employeeIds.length === 0)
            return records;
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
};
exports.EmployeeWarningService = EmployeeWarningService;
exports.EmployeeWarningService = EmployeeWarningService = EmployeeWarningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeWarningService);
//# sourceMappingURL=employee-warning.service.js.map
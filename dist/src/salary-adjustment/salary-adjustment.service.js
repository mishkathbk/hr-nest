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
var SalaryAdjustmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryAdjustmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const status_constants_1 = require("../common/constants/status.constants");
let SalaryAdjustmentService = SalaryAdjustmentService_1 = class SalaryAdjustmentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SalaryAdjustmentService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
        const record = await this.prisma.hrm_salaryadjustment.findUnique({
            where: { salaryadjustmentid: id },
        });
        if (!record)
            throw new common_1.NotFoundException("Record not found");
        this.logger.log(`GetByKey completed | id=${id}`);
        return record;
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
        const record = await this.prisma.hrm_salaryadjustment.create({
            data: {
                employeeid: dto.employeeid ?? 0,
                salarytypeid: dto.salaryTypeid ?? 0,
                payrollyear: dto.payrolldate ? new Date(dto.payrolldate).getFullYear() : new Date().getFullYear(),
                payrollmonth: dto.payrolldate ? new Date(dto.payrolldate).getMonth() + 1 : new Date().getMonth() + 1,
                amount: dto.amount ?? null,
                remarks: dto.remarks ?? null,
                statuscd: dto.statuscd ?? status_constants_1.STATUS_ACTIVE,
                companyid: companyId,
                createdby: currentId,
                createddate: new Date(),
                isdeleted: false,
                isactive: true,
            },
        });
        this.logger.log(`SaveData completed | salaryadjustmentid=${record.salaryadjustmentid}`);
        return record;
    }
    async updateData(id, dto, currentId, companyId) {
        this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);
        const updated = await this.prisma.hrm_salaryadjustment.update({
            where: { salaryadjustmentid: id },
            data: {
                employeeid: dto.employeeid,
                salarytypeid: dto.salarytypeid,
                payrollyear: dto.payrolldate ? new Date(dto.payrolldate).getFullYear() : undefined,
                payrollmonth: dto.payrolldate ? new Date(dto.payrolldate).getMonth() + 1 : undefined,
                amount: dto.amount,
                remarks: dto.remarks,
                statuscd: dto.statuscd,
                companyid: companyId,
                modifiedby: currentId,
                modifieddate: new Date(),
            },
        });
        if (!updated)
            throw new common_1.NotFoundException("Update failed or record not found");
        this.logger.log(`UpdateData completed | id=${id}`);
        return updated;
    }
    async deleteData(id, currentId) {
        this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);
        const updated = await this.prisma.hrm_salaryadjustment.update({
            where: { salaryadjustmentid: id },
            data: {
                isdeleted: true,
                deleteby: currentId,
                deletedate: new Date(),
            },
        });
        if (!updated)
            throw new common_1.NotFoundException("Record not found");
        this.logger.log(`DeleteData completed | id=${id}`);
        return { deleted: true };
    }
    async list(companyId, isInactiveLoad = false) {
        this.logger.log(`List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`);
        const records = await this.prisma.hrm_salaryadjustment.findMany({
            where: {
                isdeleted: false,
                statuscd: status_constants_1.STATUS_ACTIVE,
                companyid: companyId,
                ...(isInactiveLoad ? {} : { isactive: true }),
            },
            orderBy: { createddate: "desc" },
        });
        this.logger.log(`List completed | count=${records.length}`);
        return records;
    }
    async listPagination(dto, companyId) {
        const { search = "", filters = [], pageNumber = 1, pageSize = 10, sortBy = "salaryadjustmentid", isDescending = true, } = dto;
        const skip = (pageNumber - 1) * pageSize;
        this.logger.log(`ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`);
        const where = { isdeleted: false, companyid: companyId };
        if (search?.trim()) {
            where.OR = [{ remarks: { contains: search } }];
        }
        if (filters?.length > 0) {
            for (const item of filters) {
                const fieldName = item.attributeName;
                const rawValue = item.attributeValue;
                if (rawValue === "true" || rawValue === "false") {
                    where[fieldName] = rawValue === "true";
                }
                else if (!isNaN(Number(rawValue)) && rawValue.trim() !== "") {
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
        const orderBy = { [sortBy]: isDescending ? "desc" : "asc" };
        const [records, totalCount] = await this.prisma.$transaction([
            this.prisma.hrm_salaryadjustment.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
            }),
            this.prisma.hrm_salaryadjustment.count({ where }),
        ]);
        this.logger.log(`ListPagination completed | count=${records.length}, totalCount=${totalCount}`);
        return new response_interceptor_1.PaginatedResult(records, totalCount);
    }
};
exports.SalaryAdjustmentService = SalaryAdjustmentService;
exports.SalaryAdjustmentService = SalaryAdjustmentService = SalaryAdjustmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalaryAdjustmentService);
//# sourceMappingURL=salary-adjustment.service.js.map
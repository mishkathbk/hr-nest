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
var SalaryAdvanceReqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryAdvanceReqService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const unique_code_validator_1 = require("../common/validators/unique-code.validator");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const status_constants_1 = require("../common/constants/status.constants");
let SalaryAdvanceReqService = SalaryAdvanceReqService_1 = class SalaryAdvanceReqService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SalaryAdvanceReqService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
        const record = await this.prisma.hrm_salary_advance_req.findUnique({
            where: { reqid: id },
        });
        if (!record)
            throw new common_1.NotFoundException("Record not found");
        this.logger.log(`GetByKey completed | id=${id}`);
        return record;
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
        if (dto.grossSalary && dto.salaryAdvanceAmountReq) {
            await this.validateAdvanceEligibility(companyId, dto.grossSalary, dto.salaryAdvanceAmountReq);
        }
        await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_salary_advance_req", companyId, "reqno", dto.reqNo);
        const record = await this.prisma.hrm_salary_advance_req.create({
            data: {
                reqno: dto.reqNo,
                requestingfor: dto.requestingFor ?? null,
                reason: dto.reason ?? null,
                grosssalary: dto.grossSalary ?? null,
                salaryadvanceamountreq: dto.salaryAdvanceAmountReq ?? null,
                statuscd: dto.statusCd ?? status_constants_1.STATUS_ACTIVE,
                isactive: dto.isActive ?? true,
                companyid: companyId,
                createdby: currentId,
                createddate: new Date(),
                isdeleted: false,
            },
        });
        this.logger.log(`SaveData completed | reqid=${record.reqid}`);
        return record;
    }
    async updateData(id, dto, currentId, companyId) {
        this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);
        if (dto.grossSalary && dto.salaryAdvanceAmountReq) {
            await this.validateAdvanceEligibility(companyId, dto.grossSalary, dto.salaryAdvanceAmountReq, id);
        }
        if (dto.reqNo) {
            await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_salary_advance_req", companyId, "reqno", dto.reqNo, "reqid", id);
        }
        const updated = await this.prisma.hrm_salary_advance_req.update({
            where: { reqid: id },
            data: {
                reqno: dto.reqNo,
                requestingfor: dto.requestingFor ?? null,
                reason: dto.reason ?? null,
                grosssalary: dto.grossSalary ?? null,
                salaryadvanceamountreq: dto.salaryAdvanceAmountReq ?? null,
                statuscd: dto.statusCd ?? undefined,
                isactive: dto.isActive ?? undefined,
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
        const updated = await this.prisma.hrm_salary_advance_req.update({
            where: { reqid: id },
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
        const where = {
            isdeleted: false,
            companyid: companyId,
        };
        if (!isInactiveLoad) {
            where.statuscd = status_constants_1.STATUS_ACTIVE;
        }
        const records = await this.prisma.hrm_salary_advance_req.findMany({
            where,
            orderBy: { createddate: "desc" },
        });
        this.logger.log(`List completed | count=${records.length}`);
        return records;
    }
    async listPagination(dto, companyId) {
        const { search = "", filterList = [], offset = 0, limit = 10 } = dto;
        this.logger.log(`ListPagination started | companyId=${companyId}, search=${search}, offset=${offset}, limit=${limit}`);
        const where = { isdeleted: false, companyid: companyId };
        if (search) {
            where.AND = [
                {
                    OR: [
                        { reqno: { contains: search } },
                        { requestingfor: { contains: search } },
                        { reason: { contains: search } },
                    ],
                },
            ];
        }
        const [records, totalCount] = await this.prisma.$transaction([
            this.prisma.hrm_salary_advance_req.findMany({
                where,
                orderBy: { createddate: "desc" },
                skip: offset,
                take: limit,
            }),
            this.prisma.hrm_salary_advance_req.count({ where }),
        ]);
        this.logger.log(`ListPagination completed | count=${records.length}, totalCount=${totalCount}`);
        return new response_interceptor_1.PaginatedResult(records, totalCount);
    }
    async listSearch(search, companyId) {
        this.logger.log(`ListSearch started | companyId=${companyId}, search=${search}`);
        const where = {
            isdeleted: false,
            statuscd: status_constants_1.STATUS_ACTIVE,
            companyid: companyId,
        };
        if (search) {
            where.AND = [
                {
                    OR: [
                        { reqno: { contains: search } },
                        { requestingfor: { contains: search } },
                        { reason: { contains: search } },
                    ],
                },
            ];
        }
        const records = await this.prisma.hrm_salary_advance_req.findMany({
            where,
        });
        this.logger.log(`ListSearch completed | count=${records.length}`);
        return records;
    }
    async validateAdvanceEligibility(companyId, grossSalary, requestedAmount, excludeReqId) {
        let advances = await this.prisma.hrm_salary_advance_req.findMany({
            where: {
                isdeleted: false,
                companyid: companyId,
                ...(excludeReqId ? { NOT: { reqid: excludeReqId } } : {}),
            },
            orderBy: { createddate: "desc" },
        });
        const advanceCount = advances.length;
        const lastAdvanceDate = advances.length > 0 ? new Date(advances[0].createddate) : null;
        if (advanceCount >= 3) {
            throw new common_1.BadRequestException("You have already availed the maximum of three salary advances.");
        }
        if (lastAdvanceDate) {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            if (lastAdvanceDate >= sixMonthsAgo) {
                throw new common_1.BadRequestException("Only one salary advance can be granted within a six-month period.");
            }
        }
        const maxAllowed = grossSalary * 0.6 * 3;
        if (requestedAmount > maxAllowed) {
            throw new common_1.BadRequestException(`Requested amount exceeds the maximum allowed (${maxAllowed.toFixed(2)}).`);
        }
        if (requestedAmount <= 0) {
            throw new common_1.BadRequestException("Advance amount must be greater than zero.");
        }
    }
};
exports.SalaryAdvanceReqService = SalaryAdvanceReqService;
exports.SalaryAdvanceReqService = SalaryAdvanceReqService = SalaryAdvanceReqService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalaryAdvanceReqService);
//# sourceMappingURL=salary-advance-req.service.js.map
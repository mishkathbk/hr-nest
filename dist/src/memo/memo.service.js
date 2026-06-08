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
var MemoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const unique_code_validator_1 = require("../common/validators/unique-code.validator");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const status_constants_1 = require("../common/constants/status.constants");
let MemoService = MemoService_1 = class MemoService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MemoService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
        const record = await this.prisma.hrm_memo.findUnique({
            where: { memoid: id },
        });
        if (!record)
            throw new common_1.NotFoundException("Record not found");
        const withEmployee = await this.attachEmployeeNames([record]);
        this.logger.log(`GetByKey completed | id=${id}`);
        return withEmployee[0];
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
        await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_memo", companyId, "memocode", dto.memoCode);
        const record = await this.prisma.hrm_memo.create({
            data: {
                memocode: dto.memoCode,
                memotypecd: dto.memoTypeCd ?? null,
                memosubject: dto.memoSubject ?? null,
                memotext: dto.memoText ?? null,
                documentgroupid: dto.documentGroupId ?? null,
                statuscd: dto.statusCd ?? status_constants_1.STATUS_ACTIVE,
                isactive: dto.isActive ?? true,
                companyid: companyId,
                createdby: currentId,
                createddate: new Date(),
                isdeleted: false,
            },
        });
        if (dto.employeeIds && dto.employeeIds.length > 0) {
            const mappings = dto.employeeIds.map((empId) => ({
                memoid: record.memoid,
                employeeid: empId,
            }));
            await this.prisma.hrm_memo_employee.createMany({ data: mappings });
        }
        this.logger.log(`SaveData completed | memoid=${record.memoid}`);
        return record;
    }
    async updateData(id, dto, currentId, companyId) {
        this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);
        if (dto.memoCode) {
            await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_memo", companyId, "memocode", dto.memoCode, "memoid", id);
        }
        const updated = await this.prisma.hrm_memo.update({
            where: { memoid: id },
            data: {
                memocode: dto.memoCode ?? undefined,
                memotypecd: dto.memoTypeCd ?? undefined,
                memosubject: dto.memoSubject ?? undefined,
                memotext: dto.memoText ?? undefined,
                documentgroupid: dto.documentGroupId ?? undefined,
                statuscd: dto.statusCd ?? undefined,
                isactive: dto.isActive ?? undefined,
                companyid: companyId,
                modifiedby: currentId,
                modifieddate: new Date(),
            },
        });
        if (!updated)
            throw new common_1.NotFoundException("Update failed or record not found");
        if (dto.employeeIds) {
            await this.prisma.hrm_memo_employee.deleteMany({ where: { memoid: id } });
            if (dto.employeeIds.length > 0) {
                const mappings = dto.employeeIds.map((empId) => ({
                    memoid: id,
                    employeeid: empId,
                }));
                await this.prisma.hrm_memo_employee.createMany({ data: mappings });
            }
        }
        this.logger.log(`UpdateData completed | id=${id}`);
        return updated;
    }
    async deleteData(id, currentId) {
        this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);
        const updated = await this.prisma.hrm_memo.update({
            where: { memoid: id },
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
        const records = await this.prisma.hrm_memo.findMany({
            where,
            orderBy: { createddate: "desc" },
        });
        this.logger.log(`List completed | count=${records.length}`);
        return await this.attachEmployeeNames(records);
    }
    async listPagination(dto, companyId) {
        const { search = "", filterList = [], offset = 0, limit = 10 } = dto;
        this.logger.log(`ListPagination started | companyId=${companyId}, search=${search}, offset=${offset}, limit=${limit}`);
        const where = { isdeleted: false, companyid: companyId };
        if (search) {
            where.AND = [
                {
                    OR: [
                        { memocode: { contains: search } },
                        { memosubject: { contains: search } },
                        { memotext: { contains: search } },
                    ],
                },
            ];
        }
        const [records, totalCount] = await this.prisma.$transaction([
            this.prisma.hrm_memo.findMany({
                where,
                orderBy: { createddate: "desc" },
                skip: offset,
                take: limit,
            }),
            this.prisma.hrm_memo.count({ where }),
        ]);
        const recordsWithEmployeeNames = await this.attachEmployeeNames(records);
        this.logger.log(`ListPagination completed | count=${records.length}, totalCount=${totalCount}`);
        return new response_interceptor_1.PaginatedResult(recordsWithEmployeeNames, totalCount);
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
                        { memocode: { contains: search } },
                        { memosubject: { contains: search } },
                        { memotext: { contains: search } },
                    ],
                },
            ];
        }
        const records = await this.prisma.hrm_memo.findMany({
            where,
        });
        const recordsWithEmployeeNames = await this.attachEmployeeNames(records);
        this.logger.log(`ListSearch completed | count=${records.length}`);
        return recordsWithEmployeeNames;
    }
    async attachEmployeeNames(records) {
        if (!records || records.length === 0)
            return records;
        const memoIds = records.map((r) => r.memoid);
        const mappings = await this.prisma.hrm_memo_employee.findMany({
            where: { memoid: { in: memoIds } },
        });
        if (!mappings || mappings.length === 0) {
            return records.map((r) => ({ ...r, employees: [] }));
        }
        const employeeIds = [...new Set(mappings.map((m) => m.employeeid))];
        const employees = await this.prisma.hrm_employee.findMany({
            where: { employeeid: { in: employeeIds } },
            select: { employeeid: true, employeename: true },
        });
        const employeeMap = new Map(employees.map((e) => [e.employeeid, e.employeename]));
        return records.map((r) => {
            const relatedMappings = mappings.filter((m) => m.memoid === r.memoid);
            const employeesData = relatedMappings.map((m) => ({
                employeeid: m.employeeid,
                employeename: employeeMap.get(m.employeeid) || null,
            }));
            return {
                ...r,
                employees: employeesData,
            };
        });
    }
};
exports.MemoService = MemoService;
exports.MemoService = MemoService = MemoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MemoService);
//# sourceMappingURL=memo.service.js.map
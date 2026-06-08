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
var SalaryTypeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const unique_code_validator_1 = require("../common/validators/unique-code.validator");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const status_constants_1 = require("../common/constants/status.constants");
let SalaryTypeService = SalaryTypeService_1 = class SalaryTypeService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SalaryTypeService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
        const record = await this.prisma.hrm_salarytype.findUnique({
            where: { salarytypeid: id },
        });
        if (!record)
            throw new common_1.NotFoundException("Record not found");
        this.logger.log(`GetByKey completed | id=${id}`);
        return record;
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
        await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_salarytype", companyId, "salarytypecode", dto.SalaryTypeCode);
        const record = await this.prisma.hrm_salarytype.create({
            data: {
                salarytypecode: dto.SalaryTypeCode,
                salarytypename: dto.SalaryTypeName,
                salarytypecategorycd: dto.SalaryTypeCategoryCd ?? null,
                salarytypecd: dto.SalaryTypeCd ?? null,
                sortorder: dto.SortOrder ?? null,
                statuscd: dto.StatusCd ?? status_constants_1.STATUS_ACTIVE,
                companyid: companyId,
                createdby: currentId,
                createddate: new Date(),
                isdeleted: false,
                isactive: true,
            },
        });
        this.logger.log(`SaveData completed | salarytypeid=${record.salarytypeid}`);
        return record;
    }
    async updateData(id, dto, currentId, companyId) {
        this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);
        await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_salarytype", companyId, "salarytypecode", dto.SalaryTypeCode, "salarytypeid", id);
        const updated = await this.prisma.hrm_salarytype.update({
            where: { salarytypeid: id },
            data: {
                salarytypecode: dto.SalaryTypeCode,
                salarytypename: dto.SalaryTypeName,
                salarytypecategorycd: dto.SalaryTypeCategoryCd ?? null,
                salarytypecd: dto.SalaryTypeCd ?? null,
                sortorder: dto.SortOrder ?? null,
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
        const updated = await this.prisma.hrm_salarytype.update({
            where: { salarytypeid: id },
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
        const records = await this.prisma.hrm_salarytype.findMany({
            where: {
                isdeleted: false,
                statuscd: status_constants_1.STATUS_ACTIVE,
                companyid: companyId,
            },
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
            where.OR = [
                { leavecode: { contains: search } },
                { leavename: { contains: search } },
            ];
        }
        if (filterList?.length > 0) {
            for (const item of filterList) {
                const val = new Date(item.attributeValue);
                if (item.attributeName === "CAST(FromDate AS DATE)") {
                    where.OR = [
                        ...(where.OR ?? []),
                        { fromdate: { gte: val } },
                        { todate: { gte: val } },
                    ];
                }
                else if (item.attributeName === "CAST(ToDate AS DATE)") {
                    where.OR = [
                        ...(where.OR ?? []),
                        { todate: { lte: val } },
                        { fromdate: { lte: val } },
                    ];
                }
            }
        }
        const [records, totalCount] = await this.prisma.$transaction([
            this.prisma.hrm_salarytype.findMany({
                where,
                orderBy: { createddate: "desc" },
                skip: offset,
                take: limit,
            }),
            this.prisma.hrm_salarytype.count({ where }),
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
            where.OR = [
                { salarytypecode: { contains: search } },
                { salarytypename: { contains: search } },
            ];
        }
        const records = await this.prisma.hrm_salarytype.findMany({ where });
        this.logger.log(`ListSearch completed | count=${records.length}`);
        return records;
    }
};
exports.SalaryTypeService = SalaryTypeService;
exports.SalaryTypeService = SalaryTypeService = SalaryTypeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalaryTypeService);
//# sourceMappingURL=salary-type.service.js.map
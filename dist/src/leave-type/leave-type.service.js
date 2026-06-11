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
var LeaveTypeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const unique_code_validator_1 = require("../common/validators/unique-code.validator");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const status_constants_1 = require("../common/constants/status.constants");
let LeaveTypeService = LeaveTypeService_1 = class LeaveTypeService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LeaveTypeService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
        const record = await this.prisma.hrm_leavetype.findUnique({
            where: { leavetypeid: id },
        });
        if (!record)
            throw new common_1.NotFoundException("Record not found");
        this.logger.log(`GetByKey completed | id=${id}`);
        return record;
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
        await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_leavetype", companyId, "leavetypecode", dto.LeaveTypeCode);
        const record = await this.prisma.hrm_leavetype.create({
            data: {
                leavetypecode: dto.LeaveTypeCode,
                leavetypename: dto.LeaveTypeName,
                leavetypecategorycd: dto.LeaveTypeCategoryCd ?? null,
                leavetypecd: dto.LeaveTypeCd ?? null,
                maximumleavedays: dto.MaximumLeaveDays ?? null,
                daysbeforeleave: dto.DaysBeforeLeave ?? null,
                isdocumentmandatory: dto.IsDocumentMandatory ?? null,
                statuscd: dto.StatusCd ?? status_constants_1.STATUS_ACTIVE,
                companyid: companyId,
                createdby: currentId,
                createddate: new Date(),
                isdeleted: false,
                isactive: true,
            },
        });
        this.logger.log(`SaveData completed | leavetypeid=${record.leavetypeid}`);
        return record;
    }
    async updateData(id, dto, currentId, companyId) {
        this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);
        await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, "hrm_leavetype", companyId, "leavetypecode", dto.LeaveTypeCode, "leavetypeid", id);
        const updated = await this.prisma.hrm_leavetype.update({
            where: { leavetypeid: id },
            data: {
                leavetypecode: dto.LeaveTypeCode,
                leavetypename: dto.LeaveTypeName,
                leavetypecategorycd: dto.LeaveTypeCategoryCd ?? null,
                leavetypecd: dto.LeaveTypeCd ?? null,
                maximumleavedays: dto.MaximumLeaveDays ?? null,
                daysbeforeleave: dto.DaysBeforeLeave ?? null,
                isdocumentmandatory: dto.IsDocumentMandatory ?? null,
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
        const updated = await this.prisma.hrm_leavetype.update({
            where: { leavetypeid: id },
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
        const records = await this.prisma.hrm_leavetype.findMany({
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
        const { search = "", filters = [], pageNumber = 1, pageSize = 10, sortBy = "leavetypeid", isDescending = true, } = dto;
        const skip = (pageNumber - 1) * pageSize;
        this.logger.log(`ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`);
        const where = { isdeleted: false, companyid: companyId };
        if (search?.trim()) {
            where.OR = [
                { leavetypecode: { contains: search } },
                { leavetypename: { contains: search } },
            ];
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
            this.prisma.hrm_leavetype.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
            }),
            this.prisma.hrm_leavetype.count({ where }),
        ]);
        this.logger.log(`ListPagination completed | count=${records.length}, totalCount=${totalCount}`);
        return new response_interceptor_1.PaginatedResult(records, totalCount);
    }
};
exports.LeaveTypeService = LeaveTypeService;
exports.LeaveTypeService = LeaveTypeService = LeaveTypeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaveTypeService);
//# sourceMappingURL=leave-type.service.js.map
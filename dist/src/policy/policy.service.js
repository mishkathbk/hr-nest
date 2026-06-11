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
var PolicyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const unique_code_validator_1 = require("../common/validators/unique-code.validator");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const status_constants_1 = require("../common/constants/status.constants");
let PolicyService = PolicyService_1 = class PolicyService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PolicyService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
        const record = await this.prisma.hrm_policy.findUnique({
            where: { policyid: id },
        });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        this.logger.log(`GetByKey completed | id=${id}`);
        return record;
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
        await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, 'hrm_policy', companyId, 'policyno', dto.policyNo);
        const record = await this.prisma.hrm_policy.create({
            data: {
                policyno: dto.policyNo,
                policymessage: dto.policyMessage ?? null,
                regulationmessage: dto.regulationMessage ?? null,
                documentgroupid: dto.documentGroupId ?? null,
                statuscd: dto.statusCd ?? status_constants_1.STATUS_ACTIVE,
                isactive: dto.isActive ?? true,
                companyid: companyId,
                createdby: currentId,
                createddate: new Date(),
                isdeleted: false,
            },
        });
        this.logger.log(`SaveData completed | policyid=${record.policyid}`);
        return record;
    }
    async updateData(id, dto, currentId, companyId) {
        this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);
        if (dto.policyNo) {
            await (0, unique_code_validator_1.validateUniqueCode)(this.prisma, 'hrm_policy', companyId, 'policyno', dto.policyNo, 'policyid', id);
        }
        const updated = await this.prisma.hrm_policy.update({
            where: { policyid: id },
            data: {
                policyno: dto.policyNo,
                policymessage: dto.policyMessage ?? null,
                regulationmessage: dto.regulationMessage ?? null,
                documentgroupid: dto.documentGroupId ?? null,
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
        const updated = await this.prisma.hrm_policy.update({
            where: { policyid: id },
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
        const records = await this.prisma.hrm_policy.findMany({
            where,
            orderBy: { createddate: 'desc' },
        });
        this.logger.log(`List completed | count=${records.length}`);
        return records;
    }
    async listPagination(dto, companyId) {
        const { search = '', filters = [], pageNumber = 1, pageSize = 10, sortBy = 'policyid', isDescending = true, } = dto;
        const skip = (pageNumber - 1) * pageSize;
        this.logger.log(`ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`);
        const where = { isdeleted: false, companyid: companyId };
        if (search?.trim()) {
            where.OR = [
                { policyno: { contains: search } },
                { policymessage: { contains: search } },
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
            this.prisma.hrm_policy.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
            }),
            this.prisma.hrm_policy.count({ where }),
        ]);
        this.logger.log(`ListPagination completed | count=${records.length}, totalCount=${totalCount}`);
        return new response_interceptor_1.PaginatedResult(records, totalCount);
    }
};
exports.PolicyService = PolicyService;
exports.PolicyService = PolicyService = PolicyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PolicyService);
//# sourceMappingURL=policy.service.js.map
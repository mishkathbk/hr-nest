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
var LeaveCalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveCalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeaveCalendarService = LeaveCalendarService_1 = class LeaveCalendarService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LeaveCalendarService_1.name);
    }
    async getByKey(id) {
        this.logger.log(`GetByKey started | id=${id}`);
    }
    async saveData(dto, currentId, companyId) {
        this.logger.log(`SaveData started | userId=${currentId}, companyId=${companyId}`);
    }
    async updateData(id, dto, currentId, companyId) {
        this.logger.log(`UpdateData started | id=${id}, userId=${currentId}`);
    }
    async deleteData(id, currentId) {
        this.logger.log(`DeleteData started | id=${id}, userId=${currentId}`);
        return { deleted: true };
    }
    async list(companyId, isInactiveLoad = false) {
        this.logger.log(`List started | companyId=${companyId}, isInactiveLoad=${isInactiveLoad}`);
    }
    async listPagination(dto, companyId) {
        const { search = '', filters = [], pageNumber = 1, pageSize = 10, sortBy = 'leavecalendarid', isDescending = true, } = dto;
        const skip = (pageNumber - 1) * pageSize;
        this.logger.log(`ListPagination started | companyId=${companyId}, search=${search}, page=${pageNumber}, pageSize=${pageSize}, sortBy=${sortBy}, isDescending=${isDescending}`);
        const where = { isdeleted: false, companyid: companyId };
        if (search?.trim()) {
            where.OR = [
                { leavecode: { contains: search } },
                { leavename: { contains: search } },
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
        return;
    }
};
exports.LeaveCalendarService = LeaveCalendarService;
exports.LeaveCalendarService = LeaveCalendarService = LeaveCalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaveCalendarService);
//# sourceMappingURL=leave-calendar.service.js.map
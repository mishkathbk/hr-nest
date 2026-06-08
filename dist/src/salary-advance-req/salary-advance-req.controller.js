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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryAdvanceReqController = void 0;
const common_1 = require("@nestjs/common");
const user_decorator_1 = require("../common/decorators/user.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const salary_advance_req_service_1 = require("./salary-advance-req.service");
const create_salary_advance_req_dto_1 = require("./dto/create-salary-advance-req.dto");
const update_salary_advance_req_dto_1 = require("./dto/update-salary-advance-req.dto");
const pagination_salary_advance_req_dto_1 = require("./dto/pagination-salary-advance-req.dto");
let SalaryAdvanceReqController = class SalaryAdvanceReqController {
    constructor(salaryAdvanceReqService) {
        this.salaryAdvanceReqService = salaryAdvanceReqService;
    }
    listSearch(q = '', companyId) {
        return this.salaryAdvanceReqService.listSearch(q, companyId);
    }
    listPagination(dto, companyId) {
        return this.salaryAdvanceReqService.listPagination(dto, companyId);
    }
    list(inactive, companyId) {
        return this.salaryAdvanceReqService.list(companyId, inactive === 'true');
    }
    getByKey(id) {
        return this.salaryAdvanceReqService.getByKey(id);
    }
    saveData(dto, currentId, companyId) {
        return this.salaryAdvanceReqService.saveData(dto, currentId, companyId);
    }
    updateData(id, dto, currentId, companyId) {
        return this.salaryAdvanceReqService.updateData(id, dto, currentId, companyId);
    }
    deleteData(id, currentId) {
        return this.salaryAdvanceReqService.deleteData(id, currentId);
    }
};
exports.SalaryAdvanceReqController = SalaryAdvanceReqController;
__decorate([
    (0, common_1.Get)('list/search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdvanceReqController.prototype, "listSearch", null);
__decorate([
    (0, common_1.Post)('list/pagination'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_salary_advance_req_dto_1.PaginationSalaryAdvanceReqDto, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdvanceReqController.prototype, "listPagination", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('inactive')),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdvanceReqController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SalaryAdvanceReqController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, response_message_decorator_1.ResponseMessage)('Created successfully'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('currentId')),
    __param(2, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_salary_advance_req_dto_1.CreateSalaryAdvanceReqDto, Number, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdvanceReqController.prototype, "saveData", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Updated successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)('currentId')),
    __param(3, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_salary_advance_req_dto_1.UpdateSalaryAdvanceReqDto, Number, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdvanceReqController.prototype, "updateData", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Deleted successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)('currentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdvanceReqController.prototype, "deleteData", null);
exports.SalaryAdvanceReqController = SalaryAdvanceReqController = __decorate([
    (0, common_1.Controller)('salary-advance-req'),
    __metadata("design:paramtypes", [salary_advance_req_service_1.SalaryAdvanceReqService])
], SalaryAdvanceReqController);
//# sourceMappingURL=salary-advance-req.controller.js.map
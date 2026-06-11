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
exports.SalaryAdjustmentController = void 0;
const common_1 = require("@nestjs/common");
const user_decorator_1 = require("../common/decorators/user.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const salary_adjustment_service_1 = require("./salary-adjustment.service");
const create_salary_adjustment_dto_1 = require("./dto/create-salary-adjustment.dto");
const update_salary_adjustment_dto_1 = require("./dto/update-salary-adjustment.dto");
const pagination_salary_adjustment_dto_1 = require("./dto/pagination-salary-adjustment.dto");
let SalaryAdjustmentController = class SalaryAdjustmentController {
    constructor(salaryAdjustmentService) {
        this.salaryAdjustmentService = salaryAdjustmentService;
    }
    listPagination(dto, companyId) {
        return this.salaryAdjustmentService.listPagination(dto, companyId);
    }
    list(inactive, companyId) {
        return this.salaryAdjustmentService.list(companyId, inactive === "true");
    }
    getByKey(id) {
        return this.salaryAdjustmentService.getByKey(id);
    }
    saveData(dto, currentId, companyId) {
        return this.salaryAdjustmentService.saveData(dto, currentId, companyId);
    }
    updateData(id, dto, currentId, companyId) {
        return this.salaryAdjustmentService.updateData(id, dto, currentId, companyId);
    }
    deleteData(id, currentId) {
        return this.salaryAdjustmentService.deleteData(id, currentId);
    }
};
exports.SalaryAdjustmentController = SalaryAdjustmentController;
__decorate([
    (0, common_1.Post)("list/pagination"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_salary_adjustment_dto_1.PaginationSalaryAdjustmentDto, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdjustmentController.prototype, "listPagination", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("inactive")),
    __param(1, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdjustmentController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SalaryAdjustmentController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, response_message_decorator_1.ResponseMessage)("Created successfully"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)("currentId")),
    __param(2, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_salary_adjustment_dto_1.CreateSalaryAdjustmentDto, Number, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdjustmentController.prototype, "saveData", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, response_message_decorator_1.ResponseMessage)("Updated successfully"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)("currentId")),
    __param(3, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_salary_adjustment_dto_1.UpdateSalaryAdjustmentDto, Number, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdjustmentController.prototype, "updateData", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, response_message_decorator_1.ResponseMessage)("Deleted successfully"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)("currentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SalaryAdjustmentController.prototype, "deleteData", null);
exports.SalaryAdjustmentController = SalaryAdjustmentController = __decorate([
    (0, common_1.Controller)("salary-adjustment"),
    __metadata("design:paramtypes", [salary_adjustment_service_1.SalaryAdjustmentService])
], SalaryAdjustmentController);
//# sourceMappingURL=salary-adjustment.controller.js.map
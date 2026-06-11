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
exports.EmployeeWarningController = void 0;
const common_1 = require("@nestjs/common");
const user_decorator_1 = require("../common/decorators/user.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const employee_warning_service_1 = require("./employee-warning.service");
const create_employee_warning_dto_1 = require("./dto/create-employee-warning.dto");
const update_employee_warning_dto_1 = require("./dto/update-employee-warning.dto");
const pagination_employee_warning_dto_1 = require("./dto/pagination-employee-warning.dto");
let EmployeeWarningController = class EmployeeWarningController {
    constructor(employeeWarningService) {
        this.employeeWarningService = employeeWarningService;
    }
    listPagination(dto, companyId) {
        return this.employeeWarningService.listPagination(dto, companyId);
    }
    list(inactive, companyId) {
        return this.employeeWarningService.list(companyId, inactive === 'true');
    }
    getByKey(id) {
        return this.employeeWarningService.getByKey(id);
    }
    saveData(dto, currentId, companyId) {
        return this.employeeWarningService.saveData(dto, currentId, companyId);
    }
    updateData(id, dto, currentId, companyId) {
        return this.employeeWarningService.updateData(id, dto, currentId, companyId);
    }
    deleteData(id, currentId) {
        return this.employeeWarningService.deleteData(id, currentId);
    }
};
exports.EmployeeWarningController = EmployeeWarningController;
__decorate([
    (0, common_1.Post)('list/pagination'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_employee_warning_dto_1.PaginationEmployeeWarningDto, Number]),
    __metadata("design:returntype", void 0)
], EmployeeWarningController.prototype, "listPagination", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('inactive')),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], EmployeeWarningController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmployeeWarningController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, response_message_decorator_1.ResponseMessage)('Created successfully'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('currentId')),
    __param(2, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_warning_dto_1.CreateEmployeeWarningDto, Number, Number]),
    __metadata("design:returntype", void 0)
], EmployeeWarningController.prototype, "saveData", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Updated successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)('currentId')),
    __param(3, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_employee_warning_dto_1.UpdateEmployeeWarningDto, Number, Number]),
    __metadata("design:returntype", void 0)
], EmployeeWarningController.prototype, "updateData", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Deleted successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)('currentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EmployeeWarningController.prototype, "deleteData", null);
exports.EmployeeWarningController = EmployeeWarningController = __decorate([
    (0, common_1.Controller)('employee-warning'),
    __metadata("design:paramtypes", [employee_warning_service_1.EmployeeWarningService])
], EmployeeWarningController);
//# sourceMappingURL=employee-warning.controller.js.map
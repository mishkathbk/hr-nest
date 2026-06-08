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
exports.LeaveTypeController = void 0;
const common_1 = require("@nestjs/common");
const user_decorator_1 = require("../common/decorators/user.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const leave_type_service_1 = require("./leave-type.service");
const create_leave_type_dto_1 = require("./dto/create-leave-type.dto");
const update_leave_type_dto_1 = require("./dto/update-leave-type.dto");
const pagination_leave_type_dto_1 = require("./dto/pagination-leave-type.dto");
let LeaveTypeController = class LeaveTypeController {
    constructor(LeaveTypeService) {
        this.LeaveTypeService = LeaveTypeService;
    }
    listSearch(q = "", companyId) {
        return this.LeaveTypeService.listSearch(q, companyId);
    }
    listPagination(dto, companyId) {
        return this.LeaveTypeService.listPagination(dto, companyId);
    }
    list(inactive, companyId) {
        return this.LeaveTypeService.list(companyId, inactive === "true");
    }
    getByKey(id) {
        return this.LeaveTypeService.getByKey(id);
    }
    saveData(dto, currentId, companyId) {
        return this.LeaveTypeService.saveData(dto, currentId, companyId);
    }
    updateData(id, dto, currentId, companyId) {
        return this.LeaveTypeService.updateData(id, dto, currentId, companyId);
    }
    deleteData(id, currentId) {
        return this.LeaveTypeService.deleteData(id, currentId);
    }
};
exports.LeaveTypeController = LeaveTypeController;
__decorate([
    (0, common_1.Get)("list/search"),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], LeaveTypeController.prototype, "listSearch", null);
__decorate([
    (0, common_1.Post)("list/pagination"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_leave_type_dto_1.PaginationLeaveTypeDto, Number]),
    __metadata("design:returntype", void 0)
], LeaveTypeController.prototype, "listPagination", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("inactive")),
    __param(1, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], LeaveTypeController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LeaveTypeController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, response_message_decorator_1.ResponseMessage)("Created successfully"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)("currentId")),
    __param(2, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_type_dto_1.CreateLeaveTypeDto, Number, Number]),
    __metadata("design:returntype", void 0)
], LeaveTypeController.prototype, "saveData", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, response_message_decorator_1.ResponseMessage)("Updated successfully"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)("currentId")),
    __param(3, (0, user_decorator_1.CurrentUser)("companyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_leave_type_dto_1.UpdateLeaveTypeDto, Number, Number]),
    __metadata("design:returntype", void 0)
], LeaveTypeController.prototype, "updateData", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, response_message_decorator_1.ResponseMessage)("Deleted successfully"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)("currentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], LeaveTypeController.prototype, "deleteData", null);
exports.LeaveTypeController = LeaveTypeController = __decorate([
    (0, common_1.Controller)("leave-type"),
    __metadata("design:paramtypes", [leave_type_service_1.LeaveTypeService])
], LeaveTypeController);
//# sourceMappingURL=leave-type.controller.js.map
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
exports.PolicyController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const user_decorator_1 = require("../common/decorators/user.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const policy_service_1 = require("./policy.service");
const create_policy_dto_1 = require("./dto/create-policy.dto");
const update_policy_dto_1 = require("./dto/update-policy.dto");
const pagination_policy_dto_1 = require("./dto/pagination-policy.dto");
let PolicyController = class PolicyController {
    constructor(policyService) {
        this.policyService = policyService;
    }
    listPagination(dto, companyId) {
        return this.policyService.listPagination(dto, companyId);
    }
    list(inactive, companyId) {
        return this.policyService.list(companyId, inactive === 'true');
    }
    getByKey(id) {
        return this.policyService.getByKey(id);
    }
    saveData(dto, currentId, companyId) {
        return this.policyService.saveData(dto, currentId, companyId);
    }
    updateData(id, dto, currentId, companyId) {
        return this.policyService.updateData(id, dto, currentId, companyId);
    }
    UpdateActiveStatus(id, isactive, currentId) {
        return this.policyService.UpdateActiveStatus(id, isactive, currentId);
    }
    deleteData(id, currentId) {
        return this.policyService.deleteData(id, currentId);
    }
};
exports.PolicyController = PolicyController;
__decorate([
    (0, common_1.Post)('listPagination'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_policy_dto_1.PaginationPolicyDto, Number]),
    __metadata("design:returntype", void 0)
], PolicyController.prototype, "listPagination", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('inactive')),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], PolicyController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('GetById/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PolicyController.prototype, "getByKey", null);
__decorate([
    (0, common_1.Post)('Create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, response_message_decorator_1.ResponseMessage)('Created successfully'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('currentId')),
    __param(2, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_policy_dto_1.CreatePolicyDto, Number, Number]),
    __metadata("design:returntype", void 0)
], PolicyController.prototype, "saveData", null);
__decorate([
    (0, common_1.Put)('Update/:id'),
    (0, response_message_decorator_1.ResponseMessage)('Updated successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)('currentId')),
    __param(3, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_policy_dto_1.UpdatePolicyDto, Number, Number]),
    __metadata("design:returntype", void 0)
], PolicyController.prototype, "updateData", null);
__decorate([
    (0, common_1.Put)('UpdateActiveStatus/:id/:isactive'),
    (0, response_message_decorator_1.ResponseMessage)('Status updated successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('isactive', common_1.ParseBoolPipe)),
    __param(2, (0, user_decorator_1.CurrentUser)('currentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean, Number]),
    __metadata("design:returntype", void 0)
], PolicyController.prototype, "UpdateActiveStatus", null);
__decorate([
    (0, common_1.Delete)('Delete/:id'),
    (0, response_message_decorator_1.ResponseMessage)('Deleted successfully'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)('currentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PolicyController.prototype, "deleteData", null);
exports.PolicyController = PolicyController = __decorate([
    (0, common_1.Controller)('hrms/policy'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [policy_service_1.PolicyService])
], PolicyController);
//# sourceMappingURL=policy.controller.js.map
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
exports.PayslipController = void 0;
const common_1 = require("@nestjs/common");
const user_decorator_1 = require("../common/decorators/user.decorator");
const payslip_service_1 = require("./payslip.service");
const get_my_payslip_dto_1 = require("./dto/get-my-payslip.dto");
let PayslipController = class PayslipController {
    constructor(payslipService) {
        this.payslipService = payslipService;
    }
    async getMyPayslipList(user, dto) {
        return this.payslipService.getMyPayslipList(user.employeeId, user.companyId, dto);
    }
    async getMyPayslipDetail(user, payrollGenerationId) {
        return this.payslipService.getMyPayslipDetail(payrollGenerationId, user.employeeId, user.companyId);
    }
};
exports.PayslipController = PayslipController;
__decorate([
    (0, common_1.Get)("my"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_my_payslip_dto_1.GetMyPayslipDto]),
    __metadata("design:returntype", Promise)
], PayslipController.prototype, "getMyPayslipList", null);
__decorate([
    (0, common_1.Get)("my/:payrollGenerationId"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("payrollGenerationId", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PayslipController.prototype, "getMyPayslipDetail", null);
exports.PayslipController = PayslipController = __decorate([
    (0, common_1.Controller)("payslip"),
    __metadata("design:paramtypes", [payslip_service_1.PayslipService])
], PayslipController);
//# sourceMappingURL=payslip.controller.js.map
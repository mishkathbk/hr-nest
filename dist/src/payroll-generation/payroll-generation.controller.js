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
exports.PayrollGenerationController = void 0;
const common_1 = require("@nestjs/common");
const payroll_generation_service_1 = require("./payroll-generation.service");
const calculate_payroll_dto_1 = require("./dto/calculate-payroll.dto");
const get_payroll_list_dto_1 = require("./dto/get-payroll-list.dto");
const generate_payroll_dto_1 = require("./dto/generate-payroll.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
let PayrollGenerationController = class PayrollGenerationController {
    constructor(payrollGenerationService) {
        this.payrollGenerationService = payrollGenerationService;
    }
    calculateSalary(dto, companyId, currentId) {
        return this.payrollGenerationService.calculateSalary(dto, companyId, currentId);
    }
    getPayrollList(dto, companyId) {
        return this.payrollGenerationService.getPayrollList(dto, companyId);
    }
    generatePayroll(dto, companyId, currentId) {
        return this.payrollGenerationService.generatePayroll(dto, companyId, currentId);
    }
    getPayrollDetail(id, companyId) {
        return this.payrollGenerationService.getPayrollDetail(id, companyId);
    }
};
exports.PayrollGenerationController = PayrollGenerationController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_message_decorator_1.ResponseMessage)('Salary calculated successfully'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __param(2, (0, user_decorator_1.CurrentUser)('currentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_payroll_dto_1.CalculatePayrollDto, Number, Number]),
    __metadata("design:returntype", void 0)
], PayrollGenerationController.prototype, "calculateSalary", null);
__decorate([
    (0, common_1.Post)('list'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_payroll_list_dto_1.GetPayrollListDto, Number]),
    __metadata("design:returntype", void 0)
], PayrollGenerationController.prototype, "getPayrollList", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_message_decorator_1.ResponseMessage)('Payroll generated successfully'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __param(2, (0, user_decorator_1.CurrentUser)('currentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_payroll_dto_1.GeneratePayrollDto, Number, Number]),
    __metadata("design:returntype", void 0)
], PayrollGenerationController.prototype, "generatePayroll", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PayrollGenerationController.prototype, "getPayrollDetail", null);
exports.PayrollGenerationController = PayrollGenerationController = __decorate([
    (0, common_1.Controller)('payroll-generation'),
    __metadata("design:paramtypes", [payroll_generation_service_1.PayrollGenerationService])
], PayrollGenerationController);
//# sourceMappingURL=payroll-generation.controller.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryAdjustmentModule = void 0;
const common_1 = require("@nestjs/common");
const salary_adjustment_service_1 = require("./salary-adjustment.service");
const salary_adjustment_controller_1 = require("./salary-adjustment.controller");
let SalaryAdjustmentModule = class SalaryAdjustmentModule {
};
exports.SalaryAdjustmentModule = SalaryAdjustmentModule;
exports.SalaryAdjustmentModule = SalaryAdjustmentModule = __decorate([
    (0, common_1.Module)({
        controllers: [salary_adjustment_controller_1.SalaryAdjustmentController],
        providers: [salary_adjustment_service_1.SalaryAdjustmentService],
        exports: [salary_adjustment_service_1.SalaryAdjustmentService],
    })
], SalaryAdjustmentModule);
//# sourceMappingURL=salary-adjustment.module.js.map
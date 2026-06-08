"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryAdvanceReqModule = void 0;
const common_1 = require("@nestjs/common");
const salary_advance_req_controller_1 = require("./salary-advance-req.controller");
const salary_advance_req_service_1 = require("./salary-advance-req.service");
let SalaryAdvanceReqModule = class SalaryAdvanceReqModule {
};
exports.SalaryAdvanceReqModule = SalaryAdvanceReqModule;
exports.SalaryAdvanceReqModule = SalaryAdvanceReqModule = __decorate([
    (0, common_1.Module)({
        controllers: [salary_advance_req_controller_1.SalaryAdvanceReqController],
        providers: [salary_advance_req_service_1.SalaryAdvanceReqService],
    })
], SalaryAdvanceReqModule);
//# sourceMappingURL=salary-advance-req.module.js.map
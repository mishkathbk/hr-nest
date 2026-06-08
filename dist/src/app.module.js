"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const leave_calendar_module_1 = require("./leave-calendar/leave-calendar.module");
const salary_type_module_1 = require("./salary-type/salary-type.module");
const leave_type_module_1 = require("./leave-type/leave-type.module");
const policy_module_1 = require("./policy/policy.module");
const salary_certificate_req_module_1 = require("./salary-certificate-req/salary-certificate-req.module");
const salary_advance_req_module_1 = require("./salary-advance-req/salary-advance-req.module");
const employee_warning_module_1 = require("./employee-warning/employee-warning.module");
const memo_module_1 = require("./memo/memo.module");
const attendance_module_1 = require("./attendance/attendance.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            leave_calendar_module_1.LeaveCalendarModule,
            salary_type_module_1.SalaryTypeModule,
            leave_type_module_1.LeaveTypeModule,
            policy_module_1.PolicyModule,
            salary_certificate_req_module_1.SalaryCertificateReqModule,
            salary_advance_req_module_1.SalaryAdvanceReqModule,
            employee_warning_module_1.EmployeeWarningModule,
            memo_module_1.MemoModule,
            attendance_module_1.AttendanceModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
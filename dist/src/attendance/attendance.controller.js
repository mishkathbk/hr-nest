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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const get_by_date_dto_1 = require("./dto/get-by-date.dto");
const save_by_date_dto_1 = require("./dto/save-by-date.dto");
const monthly_grid_dto_1 = require("./dto/monthly-grid.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    getByDate(dto, companyId) {
        return this.attendanceService.getByDate(dto, companyId);
    }
    saveByDate(dto, currentId, companyId) {
        return this.attendanceService.saveByDate(dto, currentId, companyId);
    }
    getMonthlyGrid(dto, companyId) {
        return this.attendanceService.getMonthlyGrid(dto, companyId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('get-by-date'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_by_date_dto_1.GetByDateDto, Number]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getByDate", null);
__decorate([
    (0, common_1.Post)('save-by-date'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, response_message_decorator_1.ResponseMessage)('Attendance saved successfully'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('currentId')),
    __param(2, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_by_date_dto_1.SaveByDateDto, Number, Number]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "saveByDate", null);
__decorate([
    (0, common_1.Post)('monthly-grid'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monthly_grid_dto_1.MonthlyGridDto, Number]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getMonthlyGrid", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map
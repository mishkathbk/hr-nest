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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLeaveCalendarDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateLeaveCalendarDto {
}
exports.CreateLeaveCalendarDto = CreateLeaveCalendarDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'LeaveCode is required' }),
    __metadata("design:type", String)
], CreateLeaveCalendarDto.prototype, "leavecode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'LeaveName is required' }),
    __metadata("design:type", String)
], CreateLeaveCalendarDto.prototype, "leavename", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'FromDate must be a valid ISO date string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'FromDate is required' }),
    __metadata("design:type", String)
], CreateLeaveCalendarDto.prototype, "fromdate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'ToDate must be a valid ISO date string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ToDate is required' }),
    __metadata("design:type", String)
], CreateLeaveCalendarDto.prototype, "todate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateLeaveCalendarDto.prototype, "statuscd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveCalendarDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLeaveCalendarDto.prototype, "isactive", void 0);
//# sourceMappingURL=create-leave-calendar.dto.js.map
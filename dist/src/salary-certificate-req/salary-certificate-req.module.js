"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryCertificateReqModule = void 0;
const common_1 = require("@nestjs/common");
const salary_certificate_req_controller_1 = require("./salary-certificate-req.controller");
const salary_certificate_req_service_1 = require("./salary-certificate-req.service");
let SalaryCertificateReqModule = class SalaryCertificateReqModule {
};
exports.SalaryCertificateReqModule = SalaryCertificateReqModule;
exports.SalaryCertificateReqModule = SalaryCertificateReqModule = __decorate([
    (0, common_1.Module)({
        controllers: [salary_certificate_req_controller_1.SalaryCertificateReqController],
        providers: [salary_certificate_req_service_1.SalaryCertificateReqService],
    })
], SalaryCertificateReqModule);
//# sourceMappingURL=salary-certificate-req.module.js.map
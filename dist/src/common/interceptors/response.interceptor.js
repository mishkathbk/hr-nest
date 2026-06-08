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
exports.ResponseInterceptor = exports.PaginatedResult = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const response_message_decorator_1 = require("../decorators/response-message.decorator");
const crypto_1 = require("crypto");
class PaginatedResult {
    constructor(data, totalCount) {
        this.data = data;
        this.totalCount = totalCount;
    }
}
exports.PaginatedResult = PaginatedResult;
let ResponseInterceptor = class ResponseInterceptor {
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const customMessage = this.reflector.get(response_message_decorator_1.RESPONSE_MESSAGE_KEY, context.getHandler()) ??
            'Operation completed successfully';
        const req = context.switchToHttp().getRequest();
        const requestId = req.headers['x-request-id'] || req.id || (0, crypto_1.randomUUID)();
        return next.handle().pipe((0, operators_1.map)((value) => {
            const timestamp = new Date().toISOString();
            if (value instanceof PaginatedResult) {
                return {
                    success: true,
                    message: customMessage,
                    data: value.data,
                    meta: { totalCount: value.totalCount },
                    timestamp,
                    requestId,
                };
            }
            return {
                success: true,
                message: customMessage,
                data: value,
                meta: {
                    totalCount: Array.isArray(value) ? value.length : value ? 1 : 0,
                },
                timestamp,
                requestId,
            };
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map
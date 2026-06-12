"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let JwtAuthGuard = class JwtAuthGuard {
    canActivate(context) {
        const secret = process.env.JWT_SECRET;
        const issuer = process.env.JWT_ISSUER;
        const audience = process.env.JWT_AUDIENCE;
        if (!secret) {
            throw new common_1.InternalServerErrorException("JWT_SECRET is not configured");
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers["authorization"];
        const token = authHeader?.split(" ")[1];
        if (!token) {
            throw new common_1.UnauthorizedException("Access token is required");
        }
        try {
            const decoded = jwt.verify(token, secret, {
                issuer,
                audience,
            });
            request.currentId = Number(decoded["userid"]);
            request.companyId = Number(decoded["companyid"]);
            request.branchId = Number(decoded["branchid"]);
            request.username = String(decoded["username"]);
            return true;
        }
        catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new common_1.UnauthorizedException("Access token has expired");
            }
            if (err instanceof jwt.JsonWebTokenError) {
                throw new common_1.ForbiddenException("Invalid access token");
            }
            throw err;
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map
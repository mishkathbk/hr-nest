"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    request.currentId = request.currentId || 1;
    request.companyId = request.companyId || 1;
    if (data)
        return request[data];
    return { currentId: request.currentId, companyId: request.companyId };
});
//# sourceMappingURL=user.decorator.js.map
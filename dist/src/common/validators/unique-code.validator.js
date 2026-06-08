"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUniqueCode = validateUniqueCode;
const common_1 = require("@nestjs/common");
async function validateUniqueCode(prisma, modelName, companyId, codeField, codeValue, idField, excludeId) {
    if (!codeValue)
        return;
    const whereClause = {
        companyid: companyId,
        [codeField]: codeValue,
    };
    if (idField && excludeId) {
        whereClause[idField] = { not: excludeId };
    }
    const model = prisma[modelName];
    const existing = await model.findFirst({
        where: whereClause,
    });
    if (existing) {
        throw new common_1.ConflictException('Duplicate code');
    }
}
//# sourceMappingURL=unique-code.validator.js.map
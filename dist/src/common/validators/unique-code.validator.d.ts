import { PrismaService } from '../../prisma/prisma.service';
export declare function validateUniqueCode(prisma: PrismaService, modelName: string, companyId: number, codeField: string, codeValue: string, idField?: string, excludeId?: number): Promise<void>;

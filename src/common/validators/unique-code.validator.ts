import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export async function validateUniqueCode(
  prisma: PrismaService,
  modelName: string,
  companyId: number,
  codeField: string,
  codeValue: string,
  idField?: string,
  excludeId?: number,
) {
  if (!codeValue) return;

  const whereClause: any = {
    companyid: companyId,
    [codeField]: codeValue,
  };

  if (idField && excludeId) {
    whereClause[idField] = { not: excludeId };
  }

  // Dynamically access the prisma model
  const model: any = (prisma as any)[modelName];
  
  const existing = await model.findFirst({
    where: whereClause,
  });

  if (existing) {
    throw new ConflictException('Duplicate code');
  }
}

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() — PrismaService is available to every module without
 * needing to import PrismaModule explicitly in each feature module.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

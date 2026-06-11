import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PayrollGenerationService } from './payroll-generation.service';
import { PayrollGenerationController } from './payroll-generation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollGenerationController],
  providers: [PayrollGenerationService],
})
export class PayrollGenerationModule {}

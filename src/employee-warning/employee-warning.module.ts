import { Module } from '@nestjs/common';
import { EmployeeWarningService } from './employee-warning.service';
import { EmployeeWarningController } from './employee-warning.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeWarningController],
  providers: [EmployeeWarningService],
})
export class EmployeeWarningModule {}

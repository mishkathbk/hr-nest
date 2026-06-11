import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PayslipController } from './payslip.controller';
import { PayslipService } from './payslip.service';

@Module({
  imports: [PrismaModule],
  controllers: [PayslipController],
  providers: [PayslipService],
})
export class PayslipModule {}

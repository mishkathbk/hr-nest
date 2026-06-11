import { Module } from '@nestjs/common';
import { SalaryAdjustmentService } from './salary-adjustment.service';
import { SalaryAdjustmentController } from './salary-adjustment.controller';

@Module({
  controllers: [SalaryAdjustmentController],
  providers: [SalaryAdjustmentService],
  exports: [SalaryAdjustmentService],
})
export class SalaryAdjustmentModule {}

import { Module } from '@nestjs/common';
import { SalaryAdvanceReqController } from './salary-advance-req.controller';
import { SalaryAdvanceReqService } from './salary-advance-req.service';

@Module({
  controllers: [SalaryAdvanceReqController],
  providers: [SalaryAdvanceReqService],
})
export class SalaryAdvanceReqModule {}

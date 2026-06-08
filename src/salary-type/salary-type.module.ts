import { Module } from '@nestjs/common';
import { SalaryTypeController } from './salary-type.controller';
import { SalaryTypeService } from './salary-type.service';


@Module({
  controllers: [SalaryTypeController],
  providers: [SalaryTypeService],
})
export class SalaryTypeModule {}

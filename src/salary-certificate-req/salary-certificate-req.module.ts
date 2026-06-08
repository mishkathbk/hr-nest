import { Module } from '@nestjs/common';
import { SalaryCertificateReqController } from './salary-certificate-req.controller';
import { SalaryCertificateReqService } from './salary-certificate-req.service';

@Module({
  controllers: [SalaryCertificateReqController],
  providers: [SalaryCertificateReqService],
})
export class SalaryCertificateReqModule {}

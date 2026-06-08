import { Module } from '@nestjs/common';
import { MemoService } from './memo.service';
import { MemoController } from './memo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MemoController],
  providers: [MemoService],
})
export class MemoModule {}

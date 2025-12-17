import { DiskonController } from './diskon.controller';
import { PrismaService } from 'src/prisma.service';
import { DiskonService } from './diskon.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [DiskonController],
  providers: [DiskonService, PrismaService],
})
export class DiskonModule {}

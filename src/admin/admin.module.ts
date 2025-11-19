import { AdminController } from './admin.controller';
import { UserService } from 'src/user/user.service';
import { PrismaService } from '../prisma.service';
import { AdminService } from './admin.service';
import { Module } from '@nestjs/common';

@Module({
  exports: [AdminService],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, UserService],
})
export class AdminModule {}

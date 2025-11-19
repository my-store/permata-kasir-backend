import { AdminService } from 'src/admin/admin.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';

@Module({
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, PrismaService, AdminService],
})
export class UserModule {}

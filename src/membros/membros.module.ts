import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { MembrosController } from './membros.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MembrosController],
  providers: [MembrosService, PrismaService],
})
export class MembrosModule {}

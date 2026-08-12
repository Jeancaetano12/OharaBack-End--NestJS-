import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { MembrosController } from './membros.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MembrosCronService } from './membro-cron.service';

@Module({
  controllers: [MembrosController],
  providers: [MembrosService, PrismaService, MembrosCronService],
})
export class MembrosModule { }

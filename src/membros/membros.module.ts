import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { MembrosController } from './membros.controller';
import { MembrosCronService } from './membro-cron.service';

@Module({
  controllers: [MembrosController],
  providers: [MembrosService, MembrosCronService],
})
export class MembrosModule { }

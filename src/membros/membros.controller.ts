import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { BotKeyGuard } from 'src/auth/bot-key.guard';
import { CreateMembroDto } from './dto/create-membro.dto'; 

@Controller('membros')
@UseGuards(BotKeyGuard)
export class MembrosController {
constructor(private readonly membrosService: MembrosService) {}

@Post()
create(@Body() createMembroDto: CreateMembroDto[]) {
  console.log(`Membros recebidos no controlador: ${createMembroDto.length}`);
  return this.membrosService.syncMembers(createMembroDto);
}
}

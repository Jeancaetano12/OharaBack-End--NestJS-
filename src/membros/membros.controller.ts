import { Controller, UseGuards, Post, Body, Get, Query, BadRequestException} from '@nestjs/common';
import { MembrosService } from './membros.service';
import { BotKeyGuard } from 'src/auth/bot-key.guard';
import { SiteKeyGuard } from 'src/auth/site-key.guard';
import { CreateMembroDto } from './dto/create-membro.dto'; 
import { SkipThrottle } from '@nestjs/throttler';

@Controller('membros')
export class MembrosController {
constructor(private readonly membrosService: MembrosService) {}

  @Post()
  @SkipThrottle()
  @UseGuards(BotKeyGuard)
  create(@Body() createMembroDto: CreateMembroDto[]) {
    console.log(`Membros recebidos no controlador: ${createMembroDto.length}`);
    return this.membrosService.syncMembers(createMembroDto);
  }

  @Get()
  @UseGuards(SiteKeyGuard)
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '6') {
    console.log(`Listando membros - Página: ${page}, Limite: ${limit}`);
    return this.membrosService.findAll(page, limit);
  }

  @Get('search')
  @UseGuards(SiteKeyGuard)
  async searchMember(@Query('name') name: string) {
  if (!name) {
    throw new BadRequestException('O nome para busca é obrigatório');
  }
  console.log(`Buscando membro pelo nome: ${name}`);
  return await this.membrosService.findOne(name);
  }
}

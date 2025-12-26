import { Controller, UseGuards, Post, Body, Get, Query, BadRequestException, Logger} from '@nestjs/common';
import { MembrosService } from './membros.service';
import { BotKeyGuard } from '../auth/bot-key.guard';
import { SiteKeyGuard } from '../auth/site-key.guard';
import { CreateMembroDto } from './dto/create-membro.dto'; 
import { SkipThrottle } from '@nestjs/throttler';

@Controller('membros')
export class MembrosController {
  private readonly logger = new Logger(MembrosController.name);
  constructor(private readonly membrosService: MembrosService) {}

  @Post()
  @SkipThrottle()
  @UseGuards(BotKeyGuard)
  create(@Body() createMembroDto: CreateMembroDto[]) {
    this.logger.log(`Membros recebidos no controlador: ${createMembroDto.length}`);
    return this.membrosService.syncMembers(createMembroDto);
  }

  @Get()
  @UseGuards(SiteKeyGuard)
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '6') {
    this.logger.log(`Listando membros - Página: ${page}, Limite: ${limit}`);
    return this.membrosService.findAll(page, limit);
  }

  @Get('search')
  @UseGuards(SiteKeyGuard)
  async searchMember(@Query('name') name: string) {
  if (!name) {
    throw new BadRequestException('O nome para busca é obrigatório');
  }
  this.logger.log(`Buscando membro pelo nome: ${name}`);
  return await this.membrosService.findOne(name);
  }
}

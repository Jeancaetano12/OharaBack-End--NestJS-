import { Controller, UseGuards, Post, Body, Get, Query, BadRequestException, Logger} from '@nestjs/common';
import { MembrosService } from './membros.service';
import { BotKeyGuard } from '../auth/bot-key.guard';
import { SiteKeyGuard } from '../auth/site-key.guard';
import { CreateMembroDto } from './dto/create-membro.dto'; 
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('membros')
export class MembrosController {
  private readonly logger = new Logger(MembrosController.name);
  constructor(private readonly membrosService: MembrosService) {}

  @Post()
  @SkipThrottle()
  @UseGuards(BotKeyGuard)
  @ApiBody({
    description: 'Array de objetos representando os membros a serem sincronizados com os cargos recebidos pelo bot do Discord',
    type: [CreateMembroDto],
  })
  create(@Body() createMembroDto: CreateMembroDto[]) {
    this.logger.log(`Membros recebidos no controlador: ${createMembroDto.length}`);
    return this.membrosService.syncMembers(createMembroDto);
  }

  @Get()
  @UseGuards(SiteKeyGuard)
  @ApiBody({
    description: 'Parâmetros de paginação para listar os membros',
    type: Object,
  })
  @ApiQuery({ name: 'page', description: 'Número da página a ser listada', required: false, example: '1', type: String })
  @ApiQuery({ name: 'limit', description: 'Número de membros por página', required: false, example: '6', type: String })
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '6') {
    this.logger.log(`Listando membros - Página: ${page}, Limite: ${limit}`);
    return this.membrosService.findAll(page, limit);
  }

  @Get('search')
  @UseGuards(SiteKeyGuard)
  @ApiBody({
    description: 'Parâmetro de busca para encontrar um membro pelo nome de usuário, apelido ou nome global',
    type: Object,
  })
  @ApiQuery({ name: 'name', description: 'Nome do membro para busca', required: true })
  async searchMember(@Query('name') name: string) {
  if (!name) {
    throw new BadRequestException('O nome para busca é obrigatório');
  }
  this.logger.log(`Buscando membro pelo nome: ${name}`);
  return await this.membrosService.findOne(name);
  }
}

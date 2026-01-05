import { Controller, UseGuards, Post, Body, Logger } from '@nestjs/common';
import { CargosService } from './cargos.service';
import { BotKeyGuard } from '../auth/bot-key.guard';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('cargos')
@UseGuards(BotKeyGuard)
export class CargosController {
  private readonly logger = new Logger(CargosController.name);
  constructor(private readonly cargosService: CargosService) {}
  

  @Post()
  @SkipThrottle()
  create(@Body() createCargoDto: CreateCargoDto[]) {
    this.logger.log(`Cargos recebidos no controlador: ${createCargoDto.length}`);
    return this.cargosService.syncRoles(createCargoDto);
  }
}

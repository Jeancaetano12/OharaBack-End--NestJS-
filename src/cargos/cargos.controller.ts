import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { CargosService } from './cargos.service';
import { BotKeyGuard } from 'src/auth/bot-key.guard';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('cargos')
@UseGuards(BotKeyGuard)
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Post()
  @SkipThrottle()
  create(@Body() createCargoDto: CreateCargoDto[]) {
    console.log(`Cargos recebidos no controlador: ${createCargoDto.length}`);
    return this.cargosService.syncRoles(createCargoDto);
  }
}

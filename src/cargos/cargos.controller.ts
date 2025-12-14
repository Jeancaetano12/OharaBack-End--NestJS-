import { Controller } from '@nestjs/common';
import { CargosService } from './cargos.service';

@Controller('cargos')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}
}

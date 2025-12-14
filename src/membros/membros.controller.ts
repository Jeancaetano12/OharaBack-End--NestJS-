import { Controller } from '@nestjs/common';
import { MembrosService } from './membros.service';

@Controller('membros')
export class MembrosController {
  constructor(private readonly membrosService: MembrosService) {}
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembrosModule } from './membros/membros.module';
import { CargosModule } from './cargos/cargos.module';

@Module({
  imports: [MembrosModule, CargosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

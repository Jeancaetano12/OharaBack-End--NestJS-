import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    this.logger.warn('Pagina inicial acessada.');
    return 'Hello World!';
  }
}

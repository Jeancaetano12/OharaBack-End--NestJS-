import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class BotKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
   
    const apiKey = request.headers['x-api-key'];
    
    const validKey = process.env.BOT_KEY;
    
    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Acesso negado: Chave de API inválida ou ausente.');
    }

    return true;
  }
}
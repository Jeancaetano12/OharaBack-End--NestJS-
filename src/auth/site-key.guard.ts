import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SiteKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // O site deve enviar a chave neste header
    const apiKey = request.headers['x-site-key'];
    
    // Pega a chave do site definida no .env
    const validKey = process.env.SITE_KEY; 

    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Acesso negado: Chave de API inválida ou ausente.');
    }

    return true;
  }
}
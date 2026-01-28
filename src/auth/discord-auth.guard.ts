import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
  
  // Este método é chamado após o validate do Strategy
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();

    // Se der erro ou se o usuário for null (não está no banco)
    if (err || !user) {
      // REDIRECIONA PARA O FRONT-END COM UM PARÂMETRO DE ERRO
      return response.redirect(`${process.env.FRONTEND_URL}/auth/error?reason=user_not_found`);
    }

    return user;
  }
}
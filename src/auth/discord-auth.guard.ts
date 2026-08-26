import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
  private readonly logger = new Logger(DiscordAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    if (req.query.code || req.query.error) {
      const stateFromQuery = req.query.state;
      const stateFromCookie = req.cookies?.oauth_state;

      if (!stateFromQuery || stateFromQuery !== stateFromCookie) {
        this.logger.warn('State do OAuth inválido ou ausente. Possível ataque CSRF.');
        res.redirect(`${process.env.FRONTEND_URL}/auth/discord/error?reason=invalid_state`);
        return false; // Stop the execution
      }
      res.clearCookie('oauth_state');
    }

    try {
      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.logger.error('Erro durante a autenticação do Discord', err);
      return false;
    }
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    
    // Se for o callback, não enviamos opções extras
    if (req.query.code || req.query.error) {
      return {};
    }

    // Gera um novo state para o redirecionamento de login
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 5, // 5 minutos
    });
    return { state };
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Usuário não autenticado no Discord');
    }
    return user;
  }
}
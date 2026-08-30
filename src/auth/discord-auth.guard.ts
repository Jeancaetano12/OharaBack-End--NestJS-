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
        this.logger.warn(`State do OAuth inválido. Query: ${stateFromQuery}, Cookie: ${stateFromCookie}, All Cookies: ${JSON.stringify(req.cookies)}`);
        res.redirect(`${process.env.FRONTEND_URL}/auth/discord/error?reason=invalid_state`);
        return false;
      }
      res.clearCookie('oauth_state');
    }

    try {
      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.logger.error('Erro durante a autenticação do Discord', err);
      res.redirect(`${process.env.FRONTEND_URL}/auth/discord/error?reason=internal_error`);
      return false;
    }
  }



  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Usuário não autenticado no Discord');
    }
    return user;
  }
}
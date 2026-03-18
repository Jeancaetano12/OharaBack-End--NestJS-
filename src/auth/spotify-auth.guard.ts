import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SpotifyAuthGuard extends AuthGuard('spotify') {
    private readonly logger = new Logger(SpotifyAuthGuard.name);

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        
        if (req.query && req.query.error) {
            this.logger.error(`Spotify rejeitou a conexão. Motivo relatado pela API: ${req.query.error}`);
        }

        if (err || !user) {
            this.logger.warn(`Falha na autenticação. Erro interno: ${err?.message || info?.message || 'Nenhum usuário retornado pela strategy.'}`)
        }
        
        return user;
    }
}
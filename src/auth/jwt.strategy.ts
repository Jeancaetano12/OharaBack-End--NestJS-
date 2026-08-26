import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET nao esta definida nas variaveis de ambiente');
    }

    super({
      // Extrai o token do cookie 'jwt' ou do cabeçalho "Authorization: Bearer <token>" como fallback
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['jwt'];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        }
      ]),
      ignoreExpiration: false, // Se o token venceu, nega o acesso
      secretOrKey: process.env.JWT_SECRET, // A mesma chave do .env
    });
  }

  async validate(payload: any) {
    // O que retornarmos aqui será inserido automaticamente em 'req.user'
    // nas rotas protegidas
    return { id: payload.sub, discordId: payload.discordId, username: payload.username };
  }
}
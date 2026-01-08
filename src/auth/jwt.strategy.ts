import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET nao esta definida nas variaveis de ambiente');
    }

    super({
      // Extrai o token do cabeçalho "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { AuthService } from './auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackURL: process.env.DISCORD_CALLBACK_URL!,
      scope: ['identify', 'email', 'guilds'], // Permissões que você quer
      passReqToCallback: false, // Explicitly use standard StrategyOptions
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    // Aqui o Discord já confirmou que o usuário é válido.
    // Agora chamamos o AuthService para buscar ou atualizar esse usuário no banco via Prisma
    return this.authService.validateDiscordUser(profile);
  }
}
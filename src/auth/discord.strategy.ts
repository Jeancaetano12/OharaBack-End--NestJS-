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
      scope: ['identify', 'email', 'guilds'], // Permissões
      passReqToCallback: false, // Explicitly use standard StrategyOptions
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    return this.authService.validateDiscordUser(profile);
  }
}
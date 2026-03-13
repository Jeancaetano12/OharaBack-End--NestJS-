import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateDiscordUser(profile: any) {
    const { id, email } = profile;

    const user = await this.prisma.user.findUnique({
      where: { discordId: id },
    });

    if (user) {
      const updatedUser = await this.prisma.user.update({
        where: { discordId: id },
        data: { email: email },
      });

      this.logger.log(`Usuário existente atualizado: ${updatedUser.username} (${updatedUser.discordId})`);
      return updatedUser;
    }
    this.logger.log(`Usuário não encontrado no banco, Discord ID: ${id}, Login cancelado.`);
    return null;
  }

  async login(user: any) {

    const payload = {
      sub: user.id,
      discordId: user.discordId,
      globalName: user.globalName,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      serverAvatarUrl: user.serverAvatarUrl,
      serverNickName: user.serverNickName,
    };

    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async linkSpotifyAccount(jwtToken: string, spotifyProfile: any, spotifyAccessToken: string) {
    try {
      const decoded = this.jwtService.verify(jwtToken);
      const userId = decoded.sub; 
      
      if (!userId) {
        return null;
      }
      await this.prisma.connection.upsert({
        where: {
          provider_providerId: {
            provider: 'spotify',
            providerId: spotifyProfile.id,
          },
        },
        update: {
          accessToken: spotifyAccessToken,
          userId: userId,
        },
        create: {
          provider: 'spotify',
          providerId: spotifyProfile.id,
          accessToken: spotifyAccessToken,
          userId: userId,
        }
      });
      this.logger.log(`Spotify vinculado com sucesso para o usuário ID: ${userId}, Spotify ID: ${spotifyProfile.id}`);

      return {
        username: decoded.username,
        email: decoded.email,
        spotifyId: spotifyProfile.id,
        discordId: decoded.discordId,
      }
      
    } catch (error) {
      this.logger.error(`Erro ao vincular Spotify: ${error}`);
      return null;
    }
  }
}
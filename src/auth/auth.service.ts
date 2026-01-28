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
}
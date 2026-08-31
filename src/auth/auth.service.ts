import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

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

  async generateTemporaryCode(user: any) {
    const payload = {
      sub: user.id,
      type: 'exchange_code'
    };
    // Token super curto válido por apenas 1 minuto
    return this.jwtService.sign(payload, { expiresIn: '1m' });
  }

  async exchangeCodeForToken(code: string) {
    try {
      const payload = this.jwtService.verify(code);
      if (payload.type !== 'exchange_code') {
        throw new Error('Tipo de código inválido');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return this.login(user); // retorna o JWT final e permanente
    } catch (error) {
      this.logger.error('Falha ao trocar código por token. Código inválido ou expirado.', error);
      throw new Error('Código inválido ou expirado');
    }
  }
}
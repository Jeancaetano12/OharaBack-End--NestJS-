import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateDiscordUser(profile: any) {
    const { id } = profile;

    // 1. Tenta achar o usuário no banco
    let user = await this.prisma.user.findUnique({
      where: { discordId: id },
    });

    if (user) {
      return user;
    }
    
    return new NotFoundException('Usuário não encontrado no servidor. Por favor, entre no servidor primeiro.');
  }

  async login(user: any) {

    const payload = {
      sub: user.id,
      discordId: user.discordId,
      globalName: user.globalName,
      avatarUrl: user.avatarUrl,
      serverAvatarUrl: user.serverAvatarUrl,
    };

    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
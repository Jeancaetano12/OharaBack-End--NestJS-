import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateDiscordUser(profile: any) {
    const { id, username, discriminator, avatar, email } = profile;

    // 1. Tenta achar o usuário no banco
    let user = await this.prisma.user.findUnique({
      where: { discordId: id },
    });

    // 2. Se o usuário não existir, você tem duas opções:
    // Opção A: Criar um novo usuário automaticamente
    // Opção B: Retornar erro dizendo "Você precisa estar no servidor primeiro"
    
    // Vamos assumir que só atualizamos dados se ele já existir (sincronizado pelo bot), 
    // ou retornamos o usuário encontrado.
    
    if (user) {
        // Opcional: Atualizar avatar se mudou
        return user;
    }

    if (!user) {
        return new NotFoundException('Usuário não encontrado. Por favor, entre no servidor primeiro.');
    }
    
    return null; // Ou lançar erro se o usuário não for encontrado
  }
}
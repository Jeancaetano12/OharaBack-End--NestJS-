import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);

  // Busca os dados do usuário logado (Inclusive sensiveis)
  async getMe(userId: string) {
    this.logger.log(`Exibindo dados do usuário com ID: ${userId}`);
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,      // Traz o perfil completo
        connections: true,  // Traz steam, spotify (futuro)
        roles: true,        // Traz os cargos
      },
    });
  }

  async findPublicProfile(discordId: string) {
    this.logger.log(`Exibindo perfil público do usuário com Discord ID: ${discordId}`);
    const user = await this.prisma.user.findUnique({
        where: {discordId: discordId },
        select: {
            discordId: true,
            username: true,
            globalName: true,
            serverNickName: true,
            avatarUrl: true,
            serverAvatarUrl: true,
            bannerUrl: true,
            serverBannerUrl: true,
            isBot: true,
            colorHex: true,
            joinedServerAt: true,
            profile: {
              select: {
                bio: true,
                socialLinks: true,
                AvatarSite: true,
                BannerSite: true,
              }
            },

          roles: {
            select: {
              name: true,
              colorHex: true,
              position: true,
            },
            orderBy: {
              position: 'desc',
            }
          },

          connections: {
            select: {
              provider: true,
              providerId: true,
              userId: true,
            }
          }
        }
    });
    if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }
  // Atualiza (ou cria) o perfil
  async updateProfile(userId: string, data: UpdateProfileDto) {
    this.logger.log(`Sincronizando perfil do usuário com ID: ${userId}`);
    const profile = await this.prisma.profile.upsert({
      where: { userId: userId }, // Procura um perfil que pertença a este usuário

      // Se já existe, atualiza os campos enviados
      update: {
        bio: data.bio,
        socialLinks: data.socialLinks as any,
        AvatarSite: data.AvatarSite,
        BannerSite: data.BannerSite,
      },
      
      // Se NÃO existe, cria um novo vinculado ao usuário
      create: {
        userId: userId, // <--- O elo de ligação
        bio: data.bio,
        socialLinks: data.socialLinks as any,
        AvatarSite: data.AvatarSite,
        BannerSite: data.BannerSite,
      },
    });

    if (profile.createdAt.getTime() === profile.updatedAt.getTime()) {
      this.logger.log(`Perfil criado para o usuário ID: ${userId}`);
    } else {
      this.logger.log(`Perfil atualizado para o usuário ID: ${userId}`);
    }
  }
}
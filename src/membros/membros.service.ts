import { Injectable, ConflictException, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMembroDto } from './dto/create-membro.dto';

@Injectable()
export class MembrosService {
    constructor(private prisma: PrismaService) {}

    async syncMembers(createMembroDto: CreateMembroDto[]) {
        try {
            const transaction = createMembroDto.map((membro) => {
                const { rolesIds, ...userData } = membro;
                const rolesConnection = rolesIds && rolesIds.length > 0 
                    ? rolesIds.map((id) => ({ discordId: id })) 
                    : [];
                
                return this.prisma.user.upsert({
                    where: { discordId: userData.discordId },
                    update: {
                        username: userData.username,
                        globalName: userData.globalName,
                        serverNickName: userData.serverNickName,
                        avatarUrl: userData.avatarUrl,
                        serverAvatarUrl: userData.serverAvatarUrl,
                        bannerUrl: userData.bannerUrl,
                        isBot: userData.isBot,
                        colorHex: userData.colorHex,
                        roles: {
                            set: rolesConnection,
                        }
                    },

                    create: {
                        discordId: userData.discordId,
                        username: userData.username,
                        globalName: userData.globalName,
                        serverNickName: userData.serverNickName,
                        avatarUrl: userData.avatarUrl,
                        serverAvatarUrl: userData.serverAvatarUrl,
                        bannerUrl: userData.bannerUrl,
                        isBot: userData.isBot,
                        colorHex: userData.colorHex,
                        accountCreatedAt: new Date(userData.accountCreatedAt),
                        joinedServerAt: userData.joinedServerAt ? new Date(userData.joinedServerAt) : null,
                        roles: {
                            connect: rolesConnection,
                        },
                    },
                });
            });
        
            return this.prisma.$transaction(transaction);
        }   catch (error) {
            console.error(error);
            throw new Error(`Erro ao sincronizar membros: ${error.message}`);
        }
    }
}

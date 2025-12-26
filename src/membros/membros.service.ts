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
                        serverBannerUrl: userData.serverBannerUrl,
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
                        serverBannerUrl: userData.serverBannerUrl,
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

    async findAll(page: string, limit: string) {
        const pageNumber = parseInt(page, 6) > 0 ? parseInt(page, 6) : 1;
        const pageSize = parseInt(limit, 6) > 0 ? parseInt(limit, 6) : 6;

        // --- ETAPA 1: Separar os IDs ---

        // Busca IDs de quem TEM o cargo 'Dev'
        const devs = await this.prisma.user.findMany({
            where: {
                roles: { some: { name: 'Dev' } }
            },
            select: { id: true }, // Trazemos só o ID para ser leve
            orderBy: { username: 'asc' } // Devs ordenados por nome entre si
        });

        // Busca IDs de quem NÃO TEM o cargo 'Dev'
        const outrosRaw = await this.prisma.user.findMany({
            where: {
                roles: { none: { name: 'Dev' } }
            },
            select: {
                id: true,
                roles: {
                    orderBy: { position: 'desc' }, // Ordena as tags de cargo visualmente
                    take: 1,
                    select: { name: true }
                }
            }
        });
        const outrosOrdered = outrosRaw.sort((a, b) => {
            const roleA = a.roles[0]?.name || 'z';
            const roleB = b.roles[0]?.name || 'z';
            return roleA.localeCompare(roleB);
        });

        const outrosIds = outrosOrdered.map(u => ({ id: u.id }));
        // --- ETAPA 2: Juntar e Paginar ---

        // Cria uma lista única: Devs primeiro, depois o resto
        const devsIds = devs.map(d => ({ id: d.id }));
        const allIds = [...devsIds, ...outrosIds].map(u => u.id);
        const total = allIds.length;

        // Calcula onde começa e termina a página atual
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        // Pega apenas os IDs da página que o usuário pediu
        const pageIds = allIds.slice(startIndex, endIndex);

        // --- ETAPA 3: Buscar os dados Reais ---
        
        if (pageIds.length === 0) {
            return { data: [], meta: { total, page: pageNumber, limit: pageSize, totalPages: 0 } };
        }

        // Busca os usuários completos baseados nos IDs paginados
        const users = await this.prisma.user.findMany({
            where: { id: { in: pageIds } },
            include: {
                roles: {
                    orderBy: { position: 'desc' } // Ordena as tags de cargo visualmente
                }
            }
        });

        // O "WHERE IN" do SQL não garante a ordem de retorno, então reordenamos em memória
        // para garantir que a ordem dos IDs que criamos na Etapa 2 seja respeitada
        const sortedUsers = pageIds.map(id => users.find(u => u.id === id));

        return {
            data: sortedUsers,
            meta: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            }
        };
    }

    async findOne(name: string) {
    const membros = await this.prisma.user.findMany({
        where: {
            OR: [
                {
                    globalName: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
                {
                    serverNickName: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
                {
                    username: {
                        contains: name,
                        mode: 'insensitive',
                    },
                }
            ],
        },
        include: {
            roles: {
                orderBy: { position: 'desc' }
            },
        },
        orderBy: {
            globalName: 'asc' 
        }
    });
    
    return membros;
}
}

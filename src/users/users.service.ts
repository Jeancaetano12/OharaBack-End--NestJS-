import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);

  private async refreshSpotifyToken(connectionId: string, refreshToken: string): Promise<string> {
    this.logger.log(`Iniciando renovação do token do Spotify (Connection ID: ${connectionId})`);

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;;

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    
    if (!response.ok) {
      this.logger.error(`Falha ao renovar token do Spotify (Connection ID: ${connectionId}): ${response.status} ${response.statusText}`);
      throw new Error('Não foi possível renovar o token do Spotify.');
    }

    const data = await response.json();

    await this.prisma.connection.update({
      where: { id: connectionId },
      data: { accessToken: data.access_token },
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {})
    });

    this.logger.log(`Token do Spotify renovado com sucesso (Connection ID: ${connectionId})`);
    return data.access_token;
  }
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
            }
          }
        }
    });
    if (!user) {
        this.logger.warn(`Perfil público não encontrado para Discord ID: ${discordId}`);
        throw new NotFoundException('Usuário não encontrado.');
    }
    this.logger.log(`Exibindo perfil público do usuário com Discord ID: ${discordId}`);
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

  async findSpotifyProfile(discordId: string) {
    this.logger.log(`Buscando perfil do Spotify para usuário com Discord ID: ${discordId}`);

    const userSpotifyProfile = await this.prisma.user.findUnique({
      where: { discordId: discordId },
      select: {
        connections: {
          where: { provider: 'spotify' },
          select: { id: true, accessToken: true, refreshToken: true }
        }
      }
    })

    if (!userSpotifyProfile || userSpotifyProfile.connections.length === 0) {
      this.logger.warn(`Perfil do Spotify não encontrado para Discord ID: ${discordId}`);
      throw new NotFoundException('Usuário ou perfil do Spotify não encontrado.');
    }

    const spotifyConnection = userSpotifyProfile.connections[0];
    let currentAccessToken = spotifyConnection.accessToken;
    const refreshToken = spotifyConnection.refreshToken;

    const fetchFromSpotify = async (token: string) => {
      const headers = { Authorization: `Bearer ${token}` };

      const profileResponse = await fetch('https://api.spotify.com/v1/me', { headers })

      if (profileResponse.status === 401) {
        this.logger.warn(`Token do Spotify expirado para Discord ID: ${discordId}. Tentando renovar...`);
        return 401;
      }

      if (!profileResponse.ok) {
        throw new Error(`Erro na API do Spotify`);
      }

      const profileData = await profileResponse.json();
      
      const topArtistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5', { headers });
      const topArtistsData = await topArtistsResponse.json();

      const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5', { headers });
      const topTracksData = await topTracksResponse.json();

      const followingResponse = await fetch('https://api.spotify.com/v1/me/following?type=artist', { headers });
      const followingData = await followingResponse.json();

      return { profileData, topArtistsData, topTracksData, followingData };
    };

    try {
      if (!currentAccessToken) {
        throw new Error(`Access token do Spotify não encontrado.`)
      }
      let rawSpotifyData = await fetchFromSpotify(currentAccessToken);

      if (rawSpotifyData === 401) {
        if (!refreshToken) {
          throw new Error('Sessão do Spotify expirada e sem refresh token disponível.')
        }

        this.logger.log(`Token expirado para ${discordId}. Chamando renovação...`)
        currentAccessToken = await this.refreshSpotifyToken(spotifyConnection.id, refreshToken);

        rawSpotifyData = await fetchFromSpotify(currentAccessToken);
        
        if (rawSpotifyData === 401) {
          throw new Error(`Falha catastrofica: novo token rejeitado pelo spotify`);
        }
      }

      const { profileData, topArtistsData, topTracksData, followingData } = rawSpotifyData as any;

      return {
        profile: {
          name: profileData.display_name,
          spotifyUrl: profileData.external_urls?.spotify,
          followers: profileData.followers?.total,
          image: profileData.images?.[1]?.url || profileData.images?.[0]?.url || null,
        },
        topArtists: topArtistsData.items?.map(artist => ({
          name: artist.name,
          genres: artist.genres?.slice(0, 3),
          url: artist.external_urls?.spotify,
          imageUrl: artist.images?.[1]?.url || artist.images?.[0]?.url,
        })) || [],
        topTracks: topTracksData.items?.map(track => ({
          name: track.name,
          artist: track.artists?.[0]?.name,
          albumImageUrl: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
          url: track.external_urls?.spotify,
        })) || [],
        followingCount: followingData.artists?.total || 0
      };

    } catch (error) {
      this.logger.error(`Erro ao montar o perfil do Spotify: ${error}`)
      throw new Error('Erro ao processar dados do Spotify.');
    }
  }
}
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }
  private readonly logger = new Logger(UsersService.name);

  private async linkSteamAccount(userId: string, steamUrl: string) {
    try {
      this.logger.log(`Processando URL da Steam: ${steamUrl}`);

      const urlParts = steamUrl.replace(/\/$/, '').split('/');
      const idOrVanity = urlParts[urlParts.length - 1];
      const urlType = urlParts[urlParts.length - 2]; // Descobre se é "id" ou "profiles"

      let steamId64 = "";

      if (urlType === 'profiles') {
        steamId64 = idOrVanity;
      } else if (urlType === 'id') {
        const steamApiKey = process.env.STEAM_API_KEY;
        if (!steamApiKey) {
          throw new Error(`KEY DA API STEAM NAO CONFIGURADA NO .env`)
        }

        const response = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${steamApiKey}&vanityurl=${idOrVanity}`);
        const data = await response.json();

        if (data.response.success === 1) {
          steamId64 = data.response.steamid;
        } else {
          this.logger.warn(`Não foi possível resolver a URL da Steam: ${steamUrl}`)
          return;
        }
      } else {
        this.logger.warn(`Formato de URL da Steam não reconhecido: ${steamUrl}`)
        return;
      }

      const existingConnection = await this.prisma.connection.findFirst({
        where: { userId: userId, provider: 'steam' }
      });

      if (existingConnection) {
        this.logger.log(`Usuario ${userId} atualizando conexao com a steam`);
        await this.prisma.connection.update({
          where: { id: existingConnection.id },
          data: { providerId: steamId64, accessToken: steamId64 }
        });
      } else {
        this.logger.log(`Usuario ${userId} vinculando steam`)
        await this.prisma.connection.create({
          data: {
            provider: 'steam',
            providerId: steamId64,
            accessToken: steamId64,
            userId: userId
          }
        });
      }

      this.logger.log(`Steam vinculada com sucesso para o usuario ${userId} (SteamID: ${steamId64})`)
    } catch (error) {
      this.logger.error(`Erro ao processar integração com a Steam: ${error}`)
    }
  }

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
      where: { discordId: discordId },
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

    if (data.socialLinks && data.socialLinks.steam) {
      await this.linkSteamAccount(userId, data.socialLinks.steam)
    }

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
        const errorBody = await profileResponse.text();
        this.logger.error(`Spotify recusou a requisição (/me). Status: ${profileResponse.status}. Motivo: ${errorBody}`);
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

  async putSteamProfile(userId: string, steamUrl: string) {
    this.logger.log(`Adicionando link da steam isoladamente para o usuario ID: ${userId}.`)

    const currentProfile = await this.prisma.profile.findUnique({
      where: { userId: userId },
      select: { socialLinks: true }
    });

    const currentSocial = (currentProfile?.socialLinks as any) || {};

    currentSocial.steam = steamUrl;

    await this.prisma.profile.upsert({
      where: { userId: userId },
      update: { socialLinks: currentSocial },
      create: {
        userId: userId,
        socialLinks: currentSocial
      }
    });

    await this.linkSteamAccount(userId, steamUrl);

    return { message: 'Steam vinculada com sucesso ao seu perfil!' }
  }

  async getSteamSummary(discordId: string) {
    this.logger.log(`Buscando resumo da steam para o usuario ${discordId} no banco de dados.`)

    const user = await this.prisma.user.findUnique({
      where: { discordId: discordId },
      select: {
        profile: {
          select: { steamFavoriteGames: true }
        },
        connections: {
          where: { provider: 'steam' },
          select: { providerId: true }
        }
      }
    });

    if (!user || user.connections.length === 0) {
      this.logger.warn(`Usuario ${discordId} não tem steam vinculada`);
      throw new NotFoundException('Este usuário não possui a Steam vinculada.');
    }

    const steamId64 = user.connections[0].providerId;
    const steamApiKey = process.env.STEAM_API_KEY;

    try {
      const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId64}`;
      const summaryResponse = await fetch(summaryUrl);

      if (!summaryResponse.ok) {
        this.logger.error(`Erro na consulta na API para o usuario ${discordId}.`)
        throw new Error(`Erro na API da Steam: Status ${summaryResponse.status}`);
      }

      const summaryData = await summaryResponse.json();
      const steamPlayer = summaryData.response.players[0];

      if (!steamPlayer) {
        this.logger.warn(`Usuario ${discordId} possui steam privada.`)
        throw new NotFoundException('Perfil da Steam não encontrado ou privado.');
      }

      const customGames = user.profile?.steamFavoriteGames;

      return {
        steamProfile: {
          steamId: steamId64,
          personaname: steamPlayer.personaname,
          avatar: steamPlayer.avatarmedium,
          profileUrl: steamPlayer.profileurl
        },
        favoriteGames: customGames || null
      }

    } catch (error) {
      this.logger.error(`Erro ao montar resumo do perfil steam do usuario ${discordId}.`);
      throw new Error(`Não foi possível carregar o perfil da Steam. ${error}`);
    }
  }

  async getOwnedGames(discordId: string) {
    this.logger.log(`Buscando jogos da steam para o Discord ID: ${discordId}.`);

    const user = await this.prisma.user.findUnique({
      where: { discordId: discordId },
      select: {
        connections: {
          where: { provider: 'steam' },
          select: { providerId: true }
        }
      }
    });

    if (!user || user.connections.length === 0) {
      this.logger.error(`Usuario ${discordId} não possui conta steam vinculada.`)
      throw new NotFoundException('Este usuário não possuiu a steam vinculada.');
    }

    const steamId64 = user.connections[0].providerId;
    const steamApiKey = process.env.STEAM_API_KEY;

    try {
      const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamId64}&include_appinfo=true`;
      const response = await fetch(url);

      if (!response.ok) {
        this.logger.error(`Erro na requisicao dos jogos do usuario ${discordId}`);
        throw new Error(`Erro na API da Steam: Status ${response.status}`);
      }

      const data = await response.json();

      if (!data.response || !data.response.games || data.response.games.length === 0) {
        this.logger.warn(`Usuario ${discordId} possui steam privada, nao é possivel prosseguir com a busca.`)
        return {
          isPrivate: true,
          totalGames: 0,
          games: []
        };
      }

      const sortedGames = data.response.games.sort((a, b) => b.playtime_forever - a.playtime_forever);

      const formattedGames = sortedGames.map(game => ({
        appId: game.appid,
        name: game.name,
        playtimeHours: Math.round(game.playtime_forever / 60),
        coverUrl: `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/library_600x900_2x.jpg`,
        iconUrl: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
      }));

      this.logger.log(`Usuario ${discordId} com steam ok, devolvendo JSON.`)
      return {
        isPrivate: false,
        totalGames: data.response.game_count,
        games: formattedGames.slice(0, 30)
      };

    } catch (error) {
      this.logger.error(`Erro ao buscar dados da Steam: ${error}`);
      throw new Error('Nao foi possivel carregar a biblioteca da steam.')
    }
  }

  async updateSteamShowcase(userId: string, gamesArray: any[]) {
    this.logger.log(`Atualizando vitrine da steam pro usuario ${userId}.`);

    return this.prisma.profile.update({
      where: { userId: userId },
      data: { steamFavoriteGames: gamesArray }
    })
  }
}
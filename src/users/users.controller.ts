import { Controller, Get, Patch, Body, UseGuards, Req, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSteamShowcaseDto } from './dto/update-steam-showcase.dto';
import { AddSteamLinkDto } from './dto/add-steam-link.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Rota: GET /users/me
  // Retorna: Dados completos do usuário logado
  @ApiBearerAuth() // Ativa o cadeado do JWT para este endpoint
  @ApiOperation({ summary: 'Obter dados do perfil logado' })
  @ApiResponse({ status: 200, description: 'Retorna o perfil completo, incluindo dados sensíveis.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    // req.user.id vem do Token JWT decodificado
    return this.usersService.getMe(req.user.id);
  }

  // Rota: PATCH /users/me
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @ApiOperation({ summary: 'Buscar perfil público (perfil do site) por Discord ID' })
  @ApiParam({ name: 'discordId', description: 'O ID numérico do usuário no Discord', example: '243917401551273985' })
  @ApiResponse({ status: 200, description: 'Retorna apenas dados públicos e cargos.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Get(':discordId')
  async getPublicProfile(@Param('discordId') discordId: string) {
    return this.usersService.findPublicProfile(discordId);
  }

  @ApiOperation({ summary: 'Buscar perfil do Spotify por Discord ID' })
  @ApiParam({ name: 'discordId', description: 'O ID numérico do usuário no Discord', example: '243917401551273985' })
  @ApiResponse({ status: 200, description: 'Retorna o perfil do Spotify do usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Get(':discordId/spotify')
  async getSpotifyProfile(@Param('discordId') discordId: string) {
    return this.usersService.findSpotifyProfile(discordId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adiciona/Atualiza apenas o link da Steam no perfil' })
  @ApiResponse({ status: 200, description: 'Steam vinculada com sucesso.' })
  @UseGuards(JwtAuthGuard)
  @Put('me/steam/add')
  async putSteamProfile(@Req() req, @Body() body: AddSteamLinkDto) {
    return this.usersService.putSteamProfile(req.user.id, body.steamUrl);
  }

  @ApiOperation({ summary: 'Buscar resumo da Steam por Discord ID' })
  @ApiParam({ name: 'discordId', description: 'O ID numérico do usuário no Discord', example: '243917401551273985' })
  @ApiResponse({ status: 200, description: 'Retorna o resumo da Steam do usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Get(':discordId/steam/summary')
  async getSteamSummary(@Param('discordId') discordId: string) {
    return this.usersService.getSteamSummary(discordId);
  }

  @ApiOperation({ summary: 'Buscar jogos da Steam por Discord ID' })
  @ApiParam({ name: 'discordId', description: 'O ID numérico do usuário no Discord', example: '243917401551273985' })
  @ApiResponse({ status: 200, description: 'Retorna os jogos da Steam do usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Get(':discordId/steam/games')
  async getOwnedGames(@Param('discordId') discordId: string) {
    return this.usersService.getOwnedGames(discordId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar vitrine da Steam do usuário logado' })
  @ApiResponse({ status: 200, description: 'Vitrine atualizada com sucesso.' })
  @UseGuards(JwtAuthGuard)
  @Patch('me/steam/showcase')
  async updateSteamShowcase(@Req() req, @Body() body: UpdateSteamShowcaseDto) {
    return this.usersService.updateSteamShowcase(req.user.id, body.games);
  }
}
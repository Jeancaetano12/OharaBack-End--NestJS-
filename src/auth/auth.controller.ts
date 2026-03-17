import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service'; 
import { DiscordAuthGuard } from './discord-auth.guard';
import { SpotifyLoginGuard } from './spotify-login.guard';
import { SpotifyAuthGuard } from './spotify-auth.guard';
;
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {} 
  private readonly logger = new Logger(AuthController.name);

  @ApiOperation({ 
    summary: 'Inicia a autenticação com Discord', 
    description: 'Redireciona o usuário para o Discord para autenticação. Após dada a permissão, o usuário é redirecionado de volta para a aplicação.' 
  })
  @ApiResponse({ status: 302, description: 'Redirecionamento para o Discord.' })
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordLogin() {
    this.logger.log('Redirecionando autenticação para o Discord.');
    // Redireciona para o oauth2 do Discord
  }

  @ApiOperation({ 
    summary: 'Callback de autenticação do Discord', 
    description: 'Endpoint que o Discord redireciona após a autenticação. Valida o usuário, salva seu email no banco, gera um token JWT e redireciona para o frontend com o token.' 
  })
  @ApiResponse({ status: 302, description: 'Redirecionamento para o frontend com o token JWT.' })
  @Get('discord/callback')
  @UseGuards(DiscordAuthGuard)
  async discordCallback(@Req() req, @Res() res) {
    // 1. O usuário foi validado pelo DiscordStrategy e está em req.user
    const user = req.user;
    if (!user) {
      this.logger.warn('Usuário não encontrado após callback do Discord. Redirecionando para página de erro.');
      return res.redirect(`${process.env.FRONTEND_URL}/auth/discord/error?reason=user_not_found`);
    }

    this.logger.log(`Usuário autenticado: ${user.username}, email: ${user.email} (ID: ${user.discordId})`);
    const jwt = await this.authService.login(user);

    this.logger.log(`Token JWT gerado para o usuário ${user.username}, redirecionando para o frontend.`);
    res.redirect(`${process.env.FRONTEND_URL}/auth/discord/success?token=${jwt.access_token}`);
  }

  @Get('spotify')
  @UseGuards(SpotifyLoginGuard)
  async spotifyLogin() {
    this.logger.log('Redirecionando autenticação para o Spotify.');
    // Redireciona para o oauth2 do Spotify
  }

  @Get('spotify/callback')
  @UseGuards(SpotifyAuthGuard)
  async spotifyCallback(@Req() req, @Res() res) {
    const userSpotify = req.user;
    if (!userSpotify) {
      this.logger.warn(`Usuário ${userSpotify} não encontrado após callback do Spotify. Redirecionando para página de erro.`);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/spotify/error?reason=user_not_found`);
    }
  
    this.logger.log(`Usuário vinculou Spotify: ${userSpotify.username}, (ID: ${userSpotify.spotifyId})`);
    res.redirect(`${process.env.FRONTEND_URL}/pages/perfil/${userSpotify.discordId}`);
  }
}
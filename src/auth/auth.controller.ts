import { Controller, Get, Req, Res, Post, HttpStatus, UseGuards, Logger, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { DiscordAuthGuard } from './discord-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  private readonly logger = new Logger(AuthController.name);

  @ApiOperation({
    summary: 'Inicia a autenticação com Discord',
    description: 'Redireciona o usuário para o Discord para autenticação. Após dada a permissão, o usuário é redirecionado de volta para a aplicação.'
  })
  @ApiResponse({ status: 302, description: 'Redirecionamento para o Discord.' })
  @Get('discord')
  @HttpCode(HttpStatus.OK)
  async discordLogin(@Req() req, @Res() res) {
    this.logger.log('Redirecionando autenticação para o Discord com verificação de state.');

    // Gerar um state seguro e salvar em cookie HTTP-Only
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 5, // 5 minutos de validade
    });

    // Construir a URL de autorização manualmente
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.DISCORD_CALLBACK_URL || '');
    const scopes = encodeURIComponent('identify email guilds');
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${state}`;

    // Redireciona o usuário
    res.redirect(authUrl);
  }

  @ApiOperation({
    summary: 'Callback de autenticação do Discord',
    description: 'Endpoint que o Discord redireciona após a autenticação. Valida o usuário, salva seu email no banco, gera um token JWT e redireciona para o frontend com o token.'
  })
  @ApiResponse({ status: 302, description: 'Redirecionamento para o frontend com o token JWT.' })
  @Get('discord/callback')
  @HttpCode(HttpStatus.OK)
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

    res.cookie('jwt', jwt.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/discord/success`);
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Remove o token JWT do usuário limpando o cookie.'
  })
  @ApiResponse({ status: 204, description: 'Logout realizado com sucesso.' })
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req, @Res() res) {
    this.logger.log(`Efetuando logout do usuário: ${req.user?.username || 'Desconhecido'}`);

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
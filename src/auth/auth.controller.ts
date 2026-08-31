import { Controller, Get, Req, Res, Post, HttpStatus, UseGuards, Logger, HttpCode, Body, UnauthorizedException } from '@nestjs/common';
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
    this.logger.log(`Gerando código temporário para o usuário ${user.username}, redirecionando para o frontend.`);

    const temporaryCode = await this.authService.generateTemporaryCode(user);

    // Redireciona com o código de 1 minuto na URL
    res.redirect(`${process.env.FRONTEND_URL}/auth/discord/success?code=${temporaryCode}`);
  }

  @ApiOperation({
    summary: 'Troca de código temporário por JWT permanente',
    description: 'Endpoint que o frontend chama em background usando o código recebido pela URL para obter o token JWT permanente.'
  })
  @ApiResponse({ status: 200, description: 'Token JWT retornado com sucesso.' })
  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeCode(@Body('code') code: string) {
    if (!code) {
      throw new UnauthorizedException('Código de troca ausente');
    }

    try {
      const tokens = await this.authService.exchangeCodeForToken(code);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
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

    // Como estamos usando LocalStorage, o backend não tem como apagar o token fisicamente.
    // O frontend que precisa chamar isso e limpar o LocalStorage na sua ponta.
    // Opcionalmente, você poderia salvar o ID do JWT em uma blacklist no banco, mas por ora basta retornar sucesso.

    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
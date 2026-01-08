import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service'; // Importe o service

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {} // Injete o service
  private readonly logger = new Logger(AuthController.name);

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordLogin() {
    // Redireciona para o Discord
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req, @Res() res) {
    // 1. O usuário foi validado pelo DiscordStrategy e está em req.user
    const user = req.user;
    this.logger.log(`Usuário autenticado: ${user.globalName}, email: ${user.email} (ID: ${user.discordId})`);
    // 2. Geramos o token JWT para esse usuário
    const jwt = await this.authService.login(user);
    this.logger.log(`Token JWT gerado para o usuário ${user.globalName}: ${jwt.access_token}`);
    
    // Ajuste a URL para onde seu site Next.js roda (ex: localhost:3001)
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwt.access_token}`);
  }
}
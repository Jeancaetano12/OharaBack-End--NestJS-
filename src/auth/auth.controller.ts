import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service'; 
import { DiscordAuthGuard } from './discord-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {} 
  private readonly logger = new Logger(AuthController.name);

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordLogin() {
    // Redireciona para o Discord
  }

  @Get('discord/callback')
  @UseGuards(DiscordAuthGuard)
  async discordCallback(@Req() req, @Res() res) {
    // 1. O usuário foi validado pelo DiscordStrategy e está em req.user
    const user = req.user;
    this.logger.log(`Usuário autenticado: ${user.username}, email: ${user.email} (ID: ${user.discordId})`);
    
    const jwt = await this.authService.login(user);
    this.logger.log(`Token JWT gerado para o usuário ${user.username}: ${jwt.access_token}`);
    
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwt.access_token}`);
  }
}
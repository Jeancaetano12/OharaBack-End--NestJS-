import { Controller, Get, Req, Res, UseGuards, Logger} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
  
  // 1. O usuário clica no botão "Login com Discord" no site e bate aqui
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordLogin() {
    // O Guard redireciona automaticamente para a página do Discord
  }

  // 2. O Discord devolve o usuário para cá depois de logar
  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req, @Res() res) {
    // Se chegou aqui, o req.user contém os dados do usuário do Prisma (retornado do validate)
    const user = req.user;
    this.logger.log(`Usuário autenticado: ${user.globalName} (ID: ${user.discordId})`);

    // Aqui você geraria um JWT (Token de sessão) para o Front-end.
    // Por enquanto, vamos apenas redirecionar para o front com o ID na URL (simplificado)
    
    res.redirect(`${process.env.FRONTEND_URL}/perfil?userId=${user.discordId}`);
  }
}
import { Controller, Get, Patch, Body, UseGuards, Req, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Rota: GET /users/me
  // Retorna: Dados completos do usuário logado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    // req.user.id vem do Token JWT decodificado
    return this.usersService.getMe(req.user.id);
  }

  // Rota: PATCH /users/me
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get(':discordId')
  async getPublicProfile(@Param('discordId') discordId: string) {
    return this.usersService.findPublicProfile(discordId);
  }
}
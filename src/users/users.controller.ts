import { Controller, Get, Patch, Body, UseGuards, Req, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
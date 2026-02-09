import { 
  IsString, 
  IsNotEmpty, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  IsDateString ,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembroDto {
  @ApiProperty({ description: 'ID do usuário no Discord', example: '123456789012345678' })
  @IsString()
  @IsNotEmpty()
  discordId: string;

  @ApiProperty({ description: 'Nome de usuário do Discord', example: '_jeanzao' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ description: 'Nome global do usuário no Discord', example: 'Jeans' })
  @IsString()
  @IsOptional()
  globalName?: string;

  @ApiPropertyOptional({ description: 'Apelido do usuário no servidor', example: 'Jeans 😴' })
  @IsString()
  @IsOptional()
  serverNickName?: string;

  @ApiPropertyOptional({ description: 'URL do avatar global do usuário', example: 'https://cdn.discordapp.com/avatars/243917401551273985/a_c98c892eecc0772815ca0c27946d582a.gif?size=512' })
  @IsString()
  @IsOptional() // Use @IsUrl() se quiser garantir que é um link válido
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'URL do avatar do usuário no servidor', example: 'https://cdn.discordapp.com/avatars/243917401551273985/a_c98c892eecc0772815ca0c27946d582a.gif?size=512' })
  @IsString()
  @IsOptional()
  serverAvatarUrl?: string;

  @ApiPropertyOptional({ description: 'URL do banner global do usuário', example: 'https://cdn.discordapp.com/banners/243917401551273985/a_7915a648b50dd05eb106ec28f3e563ac.gif?size=512' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'URL do banner do usuário no servidor', example: 'https://cdn.discordapp.com/banners/243917401551273985/a_7915a648b50dd05eb106ec28f3e563ac.gif?size=512' })
  @IsString()
  @IsOptional()
  serverBannerUrl?: string;

  @ApiProperty({ description: 'Indica se o usuário é um bot', example: false })
  @IsBoolean()
  isBot: boolean;

  @ApiPropertyOptional({ description: 'Cor do cargo mais alto do usuário em hexadecimal', example: '#FF0000' })
  @IsString()
  @IsOptional()
  colorHex?: string;

  // IMPORTANTE: Valida que é um array e que cada item dentro é uma string
  @ApiProperty({ description: 'IDs dos cargos do usuário', example: ['123456789012345678', '987654321098765432'] })
  @IsArray()
  @IsString({ each: true }) 
  rolesIds: string[];

  // O @IsDateString valida formatos ISO 8601 (ex: 2016-08-29T01:39:24.126Z)
  // O Prisma aceita essa string e converte para DateTime automaticamente
  @ApiProperty({ description: 'Data de criação da conta do usuário', example: '2023-01-01T00:00:00.000Z' })
  @IsDateString()
  accountCreatedAt: string;

  @ApiPropertyOptional({ description: 'Data de entrada do usuário no servidor', example: '2023-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  joinedServerAt?: string;

  @ApiPropertyOptional({ description: 'Data de início do status premium do usuário', example: '2023-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  premiumSince?: string;
}
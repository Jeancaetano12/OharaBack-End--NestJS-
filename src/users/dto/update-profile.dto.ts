import { IsString, IsOptional, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
class SocialLinksDto {
  @ApiPropertyOptional({ description: 'Link do Instagram', example: 'https://www.instagram.com/usuario' })
  @IsOptional()
  @IsUrl({}, { message: 'Link do Instagram inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  instagram?: string;

  @ApiPropertyOptional({ description: 'Link do Twitter', example: 'https://www.twitter.com/usuario' })
  @IsOptional()
  @IsUrl({}, { message: 'Link do Twitter inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  twitter?: string;

  @ApiPropertyOptional({ description: 'Link do GitHub', example: 'https://www.github.com/usuario' })
  @IsOptional()
  @IsUrl({}, { message: 'Link do GitHub inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  github?: string;

  @ApiPropertyOptional({ description: 'Link do LinkedIn', example: 'https://www.linkedin.com/in/usuario' })
  @IsOptional()
  @IsUrl({}, { message: 'Link do LinkedIn inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Link da Steam', example: 'https://steamcommunity.com/id/usuario' })
  @IsOptional()
  @IsUrl({}, { message: 'Link da Steam inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  steam?: string;

  @ApiPropertyOptional({ description: 'Link do Spotify', example: 'https://open.spotify.com/user/usuario' })
  @IsOptional()
  @IsUrl({}, { message: 'Link do Spotify inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  spotify?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Biografia do usuário', example: 'Desenvolvedor apaixonado por tecnologia e música.' })
  @IsOptional()
  @IsString()
  @MaxLength(240) // Limita a bio a 240 caracteres, por exemplo
  @Transform(({ value }) => value === "" ? null : value)
  bio?: string;

  @ApiPropertyOptional({ type: () => SocialLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === "" ? null : value)
  AvatarSite?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === "" ? null : value)
  BannerSite?: string;
}
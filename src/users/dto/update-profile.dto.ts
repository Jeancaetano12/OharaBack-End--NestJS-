import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(240) // Limita a bio a 240 caracteres, por exemplo
  bio?: string;

  @IsOptional()
  @IsString()
  @IsUrl() // Valida se é um link real
  socialLinks?: Record<string, string>;

  @IsOptional()
  @IsString()
  AvatarSite?: string;

  @IsOptional()
  @IsString()
  BannerSite?: string;
}
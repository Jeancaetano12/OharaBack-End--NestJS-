import { IsString, IsOptional, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
class SocialLinksDto {
  @IsOptional()
  @IsUrl({}, { message: 'Link do Instagram inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  instagram?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link do Twitter inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  twitter?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link do GitHub inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  github?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link do LinkedIn inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  linkedin?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link da Steam inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  steam?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link do Spotify inválido'})
  @Transform(({ value }) => value === "" ? null : value)
  spotify?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(240) // Limita a bio a 240 caracteres, por exemplo
  @Transform(({ value }) => value === "" ? null : value)
  bio?: string;

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
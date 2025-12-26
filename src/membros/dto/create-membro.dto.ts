import { 
  IsString, 
  IsNotEmpty, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  IsDateString ,
} from 'class-validator';

export class CreateMembroDto {
  @IsString()
  @IsNotEmpty()
  discordId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  globalName?: string;

  @IsString()
  @IsOptional()
  serverNickName?: string;

  @IsString()
  @IsOptional() // Use @IsUrl() se quiser garantir que é um link válido
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  serverAvatarUrl?: string;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  serverBannerUrl?: string;

  @IsBoolean()
  isBot: boolean;

  @IsString()
  @IsOptional()
  colorHex?: string;

  // IMPORTANTE: Valida que é um array e que cada item dentro é uma string
  @IsArray()
  @IsString({ each: true }) 
  rolesIds: string[];

  // O @IsDateString valida formatos ISO 8601 (ex: 2016-08-29T01:39:24.126Z)
  // O Prisma aceita essa string e converte para DateTime automaticamente
  @IsDateString()
  accountCreatedAt: string;

  @IsDateString()
  @IsOptional()
  joinedServerAt?: string;

  @IsDateString()
  @IsOptional()
  premiumSince?: string;
}
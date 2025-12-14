import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  IsBoolean, 
  IsOptional, 
  IsHexColor, 
  Min,
} from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  discordId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional() // No Prisma está String?, então é opcional
  @IsString()
  // @IsHexColor() -> Dica: Ative isso apenas se tiver certeza que o bot SEMPRE manda formato Hex (#000000). 
  // O Discord às vezes manda "0" para cor padrão. Se seu bot converte antes, use IsHexColor.
  colorHex?: string;

  @IsInt()
  @Min(0)
  position: number;

  @IsString()
  @IsNotEmpty()
  permissions: string; // Vem como string do JSON ("6796053721906881")

  @IsBoolean()
  isManaged: boolean;

  @IsBoolean()
  isMentionable: boolean;

  @IsBoolean()
  isHoist: boolean;
}
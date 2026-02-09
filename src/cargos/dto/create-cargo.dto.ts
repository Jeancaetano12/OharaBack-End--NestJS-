import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  IsBoolean, 
  IsOptional, 
  IsHexColor, 
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCargoDto {
  @ApiProperty({ description: 'ID do cargo no Discord', example: '123456789012345678' })
  @IsString()
  @IsNotEmpty()
  discordId: string;

  @ApiProperty({ description: 'Nome do cargo', example: 'Dev' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Cor do cargo em hexadecimal', example: '#FF0000' })
  @IsOptional() // No Prisma está String?, então é opcional
  @IsString()
  // @IsHexColor() -> Dica: Ative isso apenas se tiver certeza que o bot SEMPRE manda formato Hex (#000000). 
  // O Discord às vezes manda "0" para cor padrão. Se seu bot converte antes, use IsHexColor.
  colorHex?: string;

  @ApiProperty({ description: 'Posição do cargo na hierarquia do servidor', example: 1 })
  @IsInt()
  @Min(0)
  position: number;

  @ApiProperty({ description: 'Permissões do cargo representadas como string de número', example: '6796053721906881' })
  @IsString()
  @IsNotEmpty()
  permissions: string; // Vem como string do JSON ("6796053721906881")

  @ApiProperty({ description: 'Indica se o cargo é gerenciado por um bot ou terceiros', example: false })
  @IsBoolean()
  isManaged: boolean;

  @ApiProperty({ description: 'Indica se o cargo pode ser mencionado', example: false })
  @IsBoolean()
  isMentionable: boolean;

  @ApiProperty({ description: 'Indica se o cargo é exibido separadamente dos membros online', example: false })
  @IsBoolean()
  isHoist: boolean;
}
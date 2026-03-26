import { IsArray, IsString, IsNumber, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SteamGameDto {
  @ApiProperty({ example: 108600 })
  @IsNumber()
  appId!: number;

  @ApiProperty({ example: 'Project Zomboid' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 258 })
  @IsNumber()
  playtimeHours!: number;

  @ApiProperty({ example: 'https://steamcdn-a.akamaihd.net/...' })
  @IsUrl()
  coverUrl!: string;

  @ApiProperty({ example: 'http://media.steampowered.com/...' })
  @IsUrl()
  iconUrl!: string;
}


export class UpdateSteamShowcaseDto {
  @ApiProperty({ type: [SteamGameDto] })
  @IsArray()
  @ValidateNested({ each: true }) 
  @Type(() => SteamGameDto) 
  games!: SteamGameDto[];
}
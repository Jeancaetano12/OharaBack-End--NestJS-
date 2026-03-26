import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSteamLinkDto {
  @ApiProperty({ example: 'https://steamcommunity.com/id/Jeanzaaao/' })
  @IsNotEmpty({ message: 'O link da Steam não pode estar vazio.' })
  @IsUrl({}, { message: 'Link da Steam inválido.' })
  steamUrl!: string;
}
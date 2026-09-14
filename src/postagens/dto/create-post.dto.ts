import { IsString, IsArray, IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
    @ApiProperty({ description: 'Título do post', example: 'Este é o título do post' })
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    @IsNotEmpty()
    tittle: string;

    @ApiProperty({ description: 'Conteúdo do post', example: 'Este é o conteúdo do post' })
    @IsString()
    @MaxLength(10000)
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ description: 'Mídia do post', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    media?: string[];

    @ApiPropertyOptional({ description: 'ID do evento relacionado ao post', example: '123456789012345678' })
    @IsOptional()
    @IsString()
    eventoId?: string;

    @ApiProperty({ description: 'ID do discord do autor do post', example: '123456789012345678' })
    @IsString()
    @IsNotEmpty()
    discordId: string;
}
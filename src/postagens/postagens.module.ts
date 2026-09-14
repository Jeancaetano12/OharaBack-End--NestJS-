import { Module } from '@nestjs/common';
import { PostagensController } from './postagens.controller';
import { PostagensService } from './postagens.service';

@Module({
    controllers: [PostagensController],
    providers: [PostagensService],
})
export class PostagensModule { }
import { Module } from '@nestjs/common';
import { PostagensController } from './postagens.controller';
import { PostagensService } from './postagens.service';
import { CleanupService } from './cleanup.service';

@Module({
    controllers: [PostagensController],
    providers: [PostagensService, CleanupService],
})
export class PostagensModule { }
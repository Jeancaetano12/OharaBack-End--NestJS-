import { Controller, Post, Get, Body, Param, Req, Query, Logger, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PostagensService } from './postagens.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('postagens')
export class PostagensController {
    private readonly logger = new Logger(PostagensController.name);
    constructor(private readonly postagensService: PostagensService) { }

    @Get()
    @ApiQuery({ name: 'page', description: 'Página a ser listada', required: false })
    @ApiQuery({ name: 'limit', description: 'Limite de itens por página', required: false })
    getFeed(@Query('page') page: string = '1', @Query('limit') limit: string = '5') {
        this.logger.log(`Solicitação de feed recebida com paginação: ${page}, limite: ${limit}`);
        return this.postagensService.getFeed(page, limit);
    }

    @Get(':id')
    @ApiQuery({ name: 'id', description: 'ID do post', required: true })
    getPost(@Param('id') id: string) {
        this.logger.log(`Solicitada exibição do post: ${id}`);
        return this.postagensService.getPost(id);
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createPost(@Body() createPostDto: CreatePostDto) {
        this.logger.log(`Solicitação de criação de post recebida por ${createPostDto.discordId}`);
        return this.postagensService.createPost(createPostDto);
    }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('arquivos', 5, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/images';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });

                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    uploadImagens(@UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:3000';
        const urls = files.map(file => `${protocol}://${host}/uploads/images/${file.filename}`);
        return { urls };
    }
}
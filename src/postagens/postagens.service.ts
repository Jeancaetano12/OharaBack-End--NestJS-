import { Injectable, Logger, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostagensService {
    private readonly logger = new Logger(PostagensService.name);
    constructor(private prisma: PrismaService) { }

    async createPost(createPostDto: CreatePostDto) {
        this.logger.log(`Solicitação de criação de post recebida por ${createPostDto.discordId}`);
        try {
            const postExiste = await this.prisma.post.findUnique({
                where: {
                    tittle: createPostDto.tittle,
                }
            })

            if (postExiste) {
                throw new BadRequestException(`Já existe um post com esse titulo.`);
            }

            if (createPostDto.media!.length > 10) {
                throw new BadRequestException(`O post deve ter menos de 10 mídias.`);
            }

            return this.prisma.post.create({
                data: {
                    tittle: createPostDto.tittle,
                    content: createPostDto.content,
                    authorId: createPostDto.discordId,
                    media: createPostDto.media,
                    eventoId: createPostDto.eventoId,
                },
            });
        } catch (error) {
            this.logger.warn(`Erro ao criar post: ${error}`);
            throw new InternalServerErrorException(`Erro ao criar post`);
        }
    }

    async getFeed(page: string, limit: string) {
        this.logger.log(`Solicitação de feed recebida com paginação: ${page}, limite: ${limit}`);
        try {
            const feed = await this.prisma.post.findMany({
                take: Number(limit),
                skip: (Number(page) - 1) * Number(limit),
                orderBy: {
                    updatedAt: 'desc', // Os últimos feitos ou editados
                },
                select: {
                    id: true,
                    tittle: true,
                    media: true,
                    evento: {
                        select: {
                            id: true,
                            nomeEvento: true,
                        }
                    }
                }
            });

            // Adiciona a foto de capa (primeira mídia do array) e formata a resposta
            const formattedFeed = feed.map(post => {
                let capa: string | null = null;

                // O campo media no banco é JSON, verificamos se é um array
                const mediaArray = post.media as string[] | null;
                if (Array.isArray(mediaArray) && mediaArray.length > 0) {
                    capa = mediaArray[0];
                }

                return {
                    ...post,
                    capa,
                };
            });

            return {
                data: formattedFeed,
                page: Number(page),
                limit: Number(limit)
            };
        } catch (error) {
            this.logger.warn(`Erro ao obter feed: ${error}`);
            throw new InternalServerErrorException(`Erro ao obter feed`);
        }
    }

    async getPost(id: string) {
        this.logger.log(`Solicitação de post recebida com id: ${id}`);
        try {
            const post = await this.prisma.post.findUnique({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    tittle: true,
                    content: true,
                    media: true,
                    authorId: true,
                    author: {
                        select: {
                            globalName: true,
                            avatarUrl: true,
                            roles: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                    comentarios: true,
                    evento: {
                        select: {
                            id: true,
                            nomeEvento: true,
                            tipoEvento: true,
                            media: true,
                            descricao: true,
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatarUrl: true,
                                }
                            },
                            dataInicio: true,
                            dataEncerramento: true,
                            createdAt: true,
                            updatedAt: true,
                        }
                    }
                }
            });

            if (!post) {
                throw new BadRequestException(`Post não encontrado.`);
            }
            const formattedPost = {
                ...post,
                capa: Array.isArray(post.media) && post.media.length > 0 ? post.media[0] : null,
            };

            return formattedPost;
        } catch (error) {
            this.logger.warn(`Erro ao obter post: ${error}`);
            throw new InternalServerErrorException(`Erro ao obter post`);
        }
    }
}
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'images');

  constructor(private prisma: PrismaService) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Iniciando rotina de limpeza de arquivos órfãos em /uploads/images...');

    if (!fs.existsSync(this.uploadsDir)) {
      this.logger.log('Diretório de uploads não encontrado, pulando limpeza.');
      return;
    }

    const files = fs.readdirSync(this.uploadsDir);
    const now = Date.now();
    // 24 horas em milissegundos
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(this.uploadsDir, file);
      const stats = fs.statSync(filePath);

      // Só avalia arquivos mais velhos que 24 horas
      if (now - stats.mtimeMs > TWENTY_FOUR_HOURS) {

        // Verifica se a string do nome do arquivo existe no conteúdo ou mídia de qualquer post.
        // Utiliza queryRaw para maior performance na busca de textos
        const postUsingFile: any[] = await this.prisma.$queryRaw`
          SELECT 1 FROM "Posts"
          WHERE content LIKE ${'%' + file + '%'}
             OR media::text LIKE ${'%' + file + '%'}
          LIMIT 1
        `;

        if (postUsingFile.length === 0) {
          try {
            fs.unlinkSync(filePath);
            this.logger.log(`Arquivo órfão excluído: ${file}`);
            deletedCount++;
          } catch (error) {
            this.logger.error(`Erro ao excluir o arquivo ${file}:`, error);
          }
        }
      }
    }

    this.logger.log(`Rotina de limpeza finalizada. ${deletedCount} arquivo(s) excluído(s).`);
  }
}

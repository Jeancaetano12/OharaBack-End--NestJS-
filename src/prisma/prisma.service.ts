import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    this.logger.log('Conectando ao banco de dados (Prisma V7 + PG Adapter)...');
    await this.$connect();
    this.logger.log('Conexão com o banco de dados estabelecida com sucesso!');
  }

  async onModuleDestroy() {
    this.logger.log('Desconectando do banco de dados (Prisma V7 + PG Adapter)...');
    await this.$disconnect();
  }
}

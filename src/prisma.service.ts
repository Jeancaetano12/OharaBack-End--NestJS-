import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // <-- tem que chamar essa bomba de driver
import 'dotenv/config' // <-- e tem que chamar essa merda tbm

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // 1. Create the PostgreSQL connection pool
    // THE ERROR IS HERE: You must pass the connectionString explicitly if it's not picking up default PG env vars
    const connectionString = `${process.env.DATABASE_URL}`;

    console.log("Tentando conectar em:", connectionString);

    const pool = new Pool({ 
      connectionString: connectionString 
    });

    // 2. Create the Adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to the PrismaClient constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
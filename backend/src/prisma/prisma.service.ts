import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
    await this.ensureTables();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async ensureTables() {
    try {
      const result = await this.$queryRawUnsafe<{exists: boolean}[]>(
        `SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='users') as exists`
      );
      if (result[0]?.exists) return;
    } catch {
      // table check failed, proceed to create
    }

    try {
      this.logger.log('Creating database tables...');
      const migrationPath = join(__dirname, '..', '..', 'prisma', 'migrations', '20260705101500_init', 'migration.sql');
      const sql = readFileSync(migrationPath, 'utf-8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const stmt of statements) {
        try {
          await this.$executeRawUnsafe(stmt + ';');
        } catch (err: any) {
          this.logger.warn(`SQL warning (non-fatal): ${err.message?.slice(0, 100)}`);
        }
      }
      this.logger.log('Database tables created');
    } catch (err: any) {
      this.logger.error(`Failed to create tables: ${err.message}`);
    }
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations');

    for (const table of tables) {
      try {
        await this.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${table}" CASCADE;`,
        );
      } catch {
        // table may not exist or may have dependencies, skip safely
      }
    }
  }
}

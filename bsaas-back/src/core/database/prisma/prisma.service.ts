import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type PrismaEvent = 'beforeExit' | 'query' | 'info' | 'warn' | 'error';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks() {
    (this.$on as (event: PrismaEvent, callback: () => Promise<void>) => void)('beforeExit', async () => {
      await this.$disconnect();
    });
  }
}

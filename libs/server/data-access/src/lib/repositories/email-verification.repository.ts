import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import type { IEmailVerificationRepository, EmailVerificationRecord } from '@cthub-bsaas/server-contracts-auth';

@Injectable()
export class EmailVerificationRepository implements IEmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertForEmail(email: string, codeHash: string, expiresAt: Date): Promise<EmailVerificationRecord> {
    const now = new Date();
    const rec = await this.prisma.emailVerification.upsert({
      where: { email },
      update: { codeHash, expiresAt, attempts: 0, usedAt: null, createdAt: now },
      create: { email, codeHash, expiresAt, attempts: 0, usedAt: null, createdAt: now },
    });
    return rec as unknown as EmailVerificationRecord;
  }

  async findActiveByEmail(email: string): Promise<EmailVerificationRecord | null> {
    const now = new Date();
    const rec = await this.prisma.emailVerification.findFirst({
      where: { email, usedAt: null, expiresAt: { gt: now } },
    });
    return (rec as unknown as EmailVerificationRecord) ?? null;
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.emailVerification.update({ where: { id }, data: { usedAt: new Date() } });
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.prisma.emailVerification.update({ where: { id }, data: { attempts: { increment: 1 } } });
  }
}


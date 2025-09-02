import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IRefreshTokenRepository } from '@cthub-bsaas/server-contracts-auth';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken> {
        return this.prisma.refreshToken.create({ data });
    }

    async findByJti(jti: string): Promise<RefreshToken | null> {
        return this.prisma.refreshToken.findUnique({ where: { jti } });
    }

    async revoke(jti: string): Promise<RefreshToken> {
        return this.prisma.refreshToken.update({
            where: { jti },
            data: { revokedAt: new Date() },
        });
    }
}

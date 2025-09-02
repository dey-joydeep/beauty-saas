import type { RefreshToken } from '@prisma/client';

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';

export interface IRefreshTokenRepository {
    create(
        data: Omit<RefreshToken, 'issuedAt' | 'revokedAt' | 'rotatedFrom'> &
            Partial<Pick<RefreshToken, 'revokedAt' | 'rotatedFrom'>>
    ): Promise<RefreshToken>;
    findByJti(jti: string): Promise<RefreshToken | null>;
    revoke(jti: string): Promise<RefreshToken>;
}

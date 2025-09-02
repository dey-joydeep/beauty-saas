import type { Session } from '@prisma/client';

export const SESSION_REPOSITORY = 'SESSION_REPOSITORY';

export interface ISessionRepository {
    create(
        data: Omit<Session, 'id' | 'createdAt' | 'lastSeenAt' | 'deviceUA' | 'deviceOS' | 'ipHash'> &
            Partial<Pick<Session, 'deviceUA' | 'deviceOS' | 'ipHash'>>
    ): Promise<Session>;
    findById(id: string): Promise<Session | null>;
    findByUserId(userId: string): Promise<Session[]>;
    update(id: string, data: Partial<Pick<Session, 'lastSeenAt'>>): Promise<Session>;
    delete(id: string): Promise<Session>;
}

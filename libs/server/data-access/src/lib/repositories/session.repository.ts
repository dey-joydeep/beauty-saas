import { Injectable } from '@nestjs/common';
import { Prisma, Session } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ISessionRepository } from '@cthub-bsaas/server-contracts-auth';

@Injectable()
export class SessionRepository implements ISessionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
        return this.prisma.session.create({ data });
    }

    async findById(id: string): Promise<Session | null> {
        return this.prisma.session.findUnique({ where: { id } });
    }

    async findByUserId(userId: string): Promise<Session[]> {
        return this.prisma.session.findMany({ where: { userId } });
    }

    async update(id: string, data: Prisma.SessionUpdateInput): Promise<Session> {
        return this.prisma.session.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Session> {
        return this.prisma.session.delete({ where: { id } });
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ICredentialTotpRepository } from '../ports/credential-totp.repository.port';
import { CredentialTOTP } from '@prisma/client';

@Injectable()
export class CredentialTotpRepository implements ICredentialTotpRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByUserId(userId: string): Promise<CredentialTOTP | null> {
        return this.prisma.credentialTOTP.findUnique({ where: { userId } });
    }

    async create(data: { userId: string; secretEncrypted: Buffer }): Promise<CredentialTOTP> {
        return this.prisma.credentialTOTP.create({
            data: {
                userId: data.userId,
                secretEncrypted: data.secretEncrypted,
            },
        });
    }

    async update(userId: string, data: { secretEncrypted?: Buffer; verified?: boolean }): Promise<CredentialTOTP> {
        return this.prisma.credentialTOTP.update({ where: { userId }, data });
    }
}

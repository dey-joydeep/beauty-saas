import { CredentialTOTP } from '@prisma/client';

export const CREDENTIAL_TOTP_REPOSITORY = 'CREDENTIAL_TOTP_REPOSITORY';

export interface ICredentialTotpRepository {
  findByUserId(userId: string): Promise<CredentialTOTP | null>;
  create(data: { userId: string; secretEncrypted: Buffer }): Promise<CredentialTOTP>;
  update(userId: string, data: { secretEncrypted?: Buffer; verified?: boolean }): Promise<CredentialTOTP>;
}

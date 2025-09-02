export abstract class ITotpService {
  abstract generateSecret(userId: string): Promise<{ qrCodeDataUrl: string }>;
  abstract verifyToken(userId: string, token: string): Promise<boolean>;
}

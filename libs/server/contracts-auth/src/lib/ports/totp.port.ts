export const TOTP_PORT = Symbol('TOTP_PORT');

export interface TotpPort {
  generateSecret(userId: string): Promise<{ qrCodeDataUrl: string; secret: string }>;
  verifyToken(userId: string, token: string): Promise<boolean>;
}

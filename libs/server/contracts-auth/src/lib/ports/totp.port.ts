export const TOTP_PORT = Symbol('TOTP_PORT');

export interface TotpPort {
  generateSecret(userId: string): Promise<{ qrCodeDataUrl: string; secret: string }>;
  verifyToken(userId: string, token: string): Promise<boolean>;
}

/**
 * @ignore
 * A dummy function to ensure the file is emitted by the compiler.
 */
export function _ensureFileIsEmitted() {
  return true;
}

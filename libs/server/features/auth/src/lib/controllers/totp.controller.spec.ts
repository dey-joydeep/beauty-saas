import { TotpController } from './totp.controller';
import { UnauthorizedException } from '@nestjs/common';

describe('TotpController', () => {
  it('setup returns qrCodeDataUrl from service', async () => {
    const service = { generateSecret: jest.fn().mockResolvedValue({ qrCodeDataUrl: 'data:image/png;base64,AAA' }) } as any;
    const ctrl = new TotpController(service);
    const res = await ctrl.setup({ user: { id: 'u1' } } as any);
    expect(res.qrCodeDataUrl).toContain('data:image/png');
    expect(service.generateSecret).toHaveBeenCalledWith('u1');
  });

  it('verify returns success on valid token', async () => {
    const service = { verifyToken: jest.fn().mockResolvedValue(true) } as any;
    const ctrl = new TotpController(service);
    const res = await ctrl.verify({ user: { id: 'u1' } } as any, { token: '123456' } as any);
    expect(res).toEqual({ success: true });
    expect(service.verifyToken).toHaveBeenCalledWith('u1', '123456');
  });

  it('verify throws on invalid token', async () => {
    const service = { verifyToken: jest.fn().mockResolvedValue(false) } as any;
    const ctrl = new TotpController(service);
    await expect(ctrl.verify({ user: { id: 'u1' } } as any, { token: '000000' } as any)).rejects.toThrow(UnauthorizedException);
  });
});

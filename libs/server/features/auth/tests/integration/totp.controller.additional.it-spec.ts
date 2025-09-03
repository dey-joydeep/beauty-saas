import { Test } from '@nestjs/testing';
import { TotpController } from '../../src/lib/controllers/totp.controller';
import { TOTP_PORT } from '@cthub-bsaas/server-contracts-auth';

describe('TotpController additional (integration-light)', () => {
  it('covers setup and verify branches', async () => {
    const totp = {
      generateSecret: jest.fn(async () => ({ qrCodeDataUrl: 'data:image/png;base64,AAA' })),
      verifyToken: jest.fn(async () => true),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [TotpController],
      providers: [{ provide: TOTP_PORT, useValue: totp }],
    }).compile();
    const ctrl = moduleRef.get(TotpController);
    const setup = await ctrl.setup({ user: { id: 'u1' } } as any);
    expect(setup.qrCodeDataUrl).toContain('data:image');
    const ok = await ctrl.verify({ user: { id: 'u1' } } as any, { token: '123456' } as any);
    expect(ok).toEqual({ success: true });
    // failure branch
    (totp.verifyToken as jest.Mock).mockResolvedValueOnce(false);
    await expect(ctrl.verify({ user: { id: 'u1' } } as any, { token: '000000' } as any)).rejects.toBeTruthy();
  });
});


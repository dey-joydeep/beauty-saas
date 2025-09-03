import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailPort } from '@cthub-bsaas/server-contracts-auth';
import nodemailer from 'nodemailer';

@Injectable()
export class NodemailerEmailAdapter implements EmailPort {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('EMAIL_HOST') ?? 'smtp.gmail.com';
    const port = Number(this.config.get<string>('EMAIL_PORT') ?? '587');
    const secure = (this.config.get<string>('EMAIL_SECURE') ?? 'false') === 'true' || port === 465;
    const user = this.config.get<string>('EMAIL_USER') ?? '';
    this.from = this.config.get<string>('EMAIL_FROM') ?? user;

    const clientId = this.config.get<string>('EMAIL_OAUTH_CLIENT_ID');
    const clientSecret = this.config.get<string>('EMAIL_OAUTH_CLIENT_SECRET');
    const refreshToken = this.config.get<string>('EMAIL_OAUTH_REFRESH_TOKEN');
    const accessToken = this.config.get<string>('EMAIL_OAUTH_ACCESS_TOKEN');

    if (clientId && clientSecret && refreshToken) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user,
          clientId,
          clientSecret,
          refreshToken,
          accessToken,
        },
      });
    } else {
      const pass = this.config.get<string>('EMAIL_PASS') ?? '';
      this.transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
    }
  }

  async sendMail(to: string, subject: string, body: string): Promise<void> {
    const isHtml = /<[^>]+>/.test(body);
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text: isHtml ? undefined : body,
      html: isHtml ? body : undefined,
    });
  }
}

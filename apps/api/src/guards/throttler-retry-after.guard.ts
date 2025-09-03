import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerRetryAfterGuard extends ThrottlerGuard {
  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    try {
      return await super.handleRequest(context, limit, ttl);
    } catch (e) {
      // Best-effort: compute remaining TTL from storage and set Retry-After
      try {
        const { res } = this.getRequestResponse(context) as { req: any; res: any };
        const tracker = this.getTracker(context);
        // generateKey and storageService are protected on base class
        const key = (this as any).generateKey(context, tracker);
        const record = await (this as any).storageService.getRecord(key);
        const retryAfter = Math.max(1, Math.ceil(record?.ttl ?? ttl ?? 60));
        if (res?.setHeader) {
          res.setHeader('Retry-After', String(retryAfter));
        }
      } catch {
        // ignore
      }
      throw e as ThrottlerException;
    }
  }
}


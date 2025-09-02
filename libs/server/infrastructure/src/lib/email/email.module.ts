import { Module } from '@nestjs/common';
import { EMAIL_PORT } from '@cthub-bsaas/server-contracts-auth';
import { ConsoleEmailAdapter } from './email.console.adapter';

/**
 * @public
 * Infrastructure module that registers the console-based {@link ConsoleEmailAdapter}
 * as the implementation for {@link EMAIL_PORT}.
 */
@Module({
  providers: [
    {
      provide: EMAIL_PORT,
      useClass: ConsoleEmailAdapter,
    },
  ],
  exports: [EMAIL_PORT],
})
export class EmailModule {}

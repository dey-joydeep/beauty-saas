import { Observable, of } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { makeStateKey, StateKey, TransferState } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export class TranslateBrowserLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    private prefix: string = './assets/i18n/',
    private suffix: string = '.json'
  ) {}

  public getTranslation(lang: string): Observable<any> {
    // Create a key for the translation data in the transfer state
    const key: StateKey<number> = makeStateKey<number>('transfer-translate-' + lang);
    
    // Try to get translations from transfer state first (SSR)
    const storedData = this.transferState.get(key, null);
    
    if (storedData) {
      // If we have translations in transfer state, use them
      return of(storedData);
    } else {
      // Otherwise, load translations via HTTP
      return new TranslateHttpLoader(
        this.http,
        this.prefix,
        this.suffix
      ).getTranslation(lang);
    }
  }
}

export function translateBrowserLoaderFactory(
  httpClient: HttpClient,
  transferState: TransferState
) {
  return new TranslateBrowserLoader(httpClient, transferState);
}

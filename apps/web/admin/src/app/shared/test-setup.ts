import { Provider } from '@angular/core';
import { TranslateService, TranslateStore } from '@ngx-translate/core';

/**
 * Shared providers for Angular component tests.
 * Use in TestBed.configureTestingModule({ providers: [ ...sharedTestProviders ] })
 */
export const sharedTestProviders: Provider[] = [TranslateService, TranslateStore];

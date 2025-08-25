import { Injectable, NgModule, Pipe, PipeTransform } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

const translations: any = {};

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(translations);
  }
}

@Pipe({
  name: 'translate',
  standalone: true,
})
export class TranslatePipeMock implements PipeTransform {
  public name = 'translate';
  public transform(query: string, ...args: any[]): any {
    return query;
  }
}

@Injectable()
export class TranslateServiceStub {
  public langs: string[] = [];
  public defaultLang: string = 'en';
  public currentLang: string = 'en';

  public get<T>(key: T): Observable<T> {
    return of(key);
  }
  public addLangs(langs: string[]) {
    this.langs = langs;
  }
  public setDefaultLang(lang: string) {
    this.defaultLang = lang;
  }
  public getBrowserLang(): string {
    return 'en';
  }
  public use(lang: string) {
    this.currentLang = lang;
  }
}

@NgModule({
  providers: [
    { provide: TranslateService, useClass: TranslateServiceStub },
    { provide: TranslatePipe, useClass: TranslatePipeMock },
  ],
  imports: [
    TranslatePipeMock, // Import standalone pipe
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: FakeLoader },
    }),
  ],
  exports: [TranslatePipeMock, TranslateModule],
})
export class TranslateTestingModule {}

import { TestBed } from '@angular/core/testing';
import { ThemeComponent } from './theme.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { ThemeService } from './theme.service';
import { sharedTestProviders } from '../../shared/test-setup';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('ThemeComponent', () => {
  let component: ThemeComponent;
  let fixture: any;
  const themeService = {
    getTheme: jest.fn(),
    updateTheme: jest.fn(),
  };

  beforeEach(async () => {
    themeService.getTheme.mockReturnValue(of('light'));
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, ThemeComponent, TranslateModule.forRoot()],
      providers: [{ provide: ThemeService, useValue: themeService }, ...sharedTestProviders, provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(ThemeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

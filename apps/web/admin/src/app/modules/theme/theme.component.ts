import { PlatformUtils } from '@beauty-saas/web-config';
import { Component, OnInit, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService, Theme } from './theme.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import type { PlatformUtils } from '@beauty-saas/web-config';
import { PLATFORM_UTILS_TOKEN } from '@beauty-saas/web-config';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent implements OnInit {
  theme: Theme | null = null;
  loading = false;
  error: string | null = null;
  themeForm: FormGroup;

  private isBrowser: boolean;

  constructor(
    private themeService: ThemeService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    @Inject(PLATFORM_UTILS_TOKEN) private platformUtils: PlatformUtils,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.themeForm = this.fb.group({
      primaryColor: ['', Validators.required],
      secondaryColor: ['', Validators.required],
      accentColor: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.fetchTheme();
  }

  fetchTheme() {
    this.loading = true;
    this.error = null;
    const token = this.platformUtils.browserLocalStorage?.getItem('token') || '';
    const tenantId = this.platformUtils.browserLocalStorage?.getItem('tenant_id') || 'test-tenant';
    this.themeService.getTheme(token, tenantId).subscribe({
      next: (theme) => {
        this.theme = theme;
        this.themeForm.patchValue({
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
        });
        this.applyTheme(theme);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to fetch theme';
        this.loading = false;
      },
    });
  }

  updateTheme() {
    if (this.themeForm.invalid) return;
    this.loading = true;
    this.error = null;
    const token = this.platformUtils.browserLocalStorage?.getItem('token') || '';
    const tenantId = this.platformUtils.browserLocalStorage?.getItem('tenant_id') || 'test-tenant';
    const params = this.themeForm.value;
    this.themeService.updateTheme(token, tenantId, params).subscribe({
      next: (updatedTheme) => {
        this.theme = updatedTheme;
        this.applyTheme(updatedTheme);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update theme';
        this.loading = false;
      },
    });
  }

  /**
   * Apply theme styles to the document
   * Safe to call in both server and browser environments
   */
  applyTheme(theme: Theme) {
    if (!this.isBrowser || !this.platformUtils.documentRef) {
      return;
    }

    try {
      const doc = this.platformUtils.documentRef;
      const rootElement = doc.documentElement;

      // Batch style updates to minimize reflows
      this.renderer.setAttribute(rootElement, 'style', ''); // Reset styles first

      // Apply new styles
      const styles: Record<string, string> = {
        '--primary-color': theme.primaryColor,
        '--secondary-color': theme.secondaryColor,
        '--accent-color': theme.accentColor,
        // Add any other theme variables here
      };

      Object.entries(styles).forEach(([key, value]) => {
        if (value) {
          this.renderer.setStyle(rootElement, key, value);
        }
      });
    } catch (error) {
      console.error('Error applying theme:', error);
      // Optionally re-throw or handle the error
    }
  }
}


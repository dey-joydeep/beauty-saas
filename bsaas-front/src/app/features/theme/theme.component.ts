import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from './theme.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Renderer2 } from '@angular/core';

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

  constructor(
    private themeService: ThemeService,
    private fb: FormBuilder,
    private renderer: Renderer2,
  ) {
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
    const token = localStorage.getItem('token') || '';
    const tenantId = localStorage.getItem('tenant_id') || 'test-tenant';
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
    const token = localStorage.getItem('token') || '';
    const tenantId = localStorage.getItem('tenant_id') || 'test-tenant';
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

  applyTheme(theme: Theme) {
    this.renderer.setStyle(document.documentElement, '--primary-color', theme.primaryColor);
    this.renderer.setStyle(document.documentElement, '--secondary-color', theme.secondaryColor);
    this.renderer.setStyle(document.documentElement, '--accent-color', theme.accentColor);
  }
}

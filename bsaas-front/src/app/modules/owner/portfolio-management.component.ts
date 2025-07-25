import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PortfolioService } from './portfolio.service';

@Component({
  selector: 'app-portfolio-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './portfolio-management.component.html',
  styleUrls: ['./portfolio-management.component.scss']
})
export class PortfolioManagementComponent {
  portfolioForm;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private portfolioService: PortfolioService) {
    this.portfolioForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      image: [null, Validators.required]
    });
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.portfolioForm.patchValue({ image: file });
      this.portfolioForm.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.portfolioForm.invalid) return;
    this.loading = true;
    this.error = null;
    // Ensure all required fields are present and not null
    const { title, description, image } = this.portfolioForm.value;
    if (!title || !description) {
      this.loading = false;
      this.error = 'Title and description are required.';
      return;
    }
    const formData = new FormData();
    formData.append('title', title as string);
    formData.append('description', description as string);
    if (image) formData.append('image', image as File);
    this.portfolioService.savePortfolio(formData).subscribe({
      next: (res: { success: boolean }) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Portfolio item saved!';
        } else {
          this.error = 'Failed to save portfolio item.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.userMessage || 'Error saving portfolio item.';
      }
    });
  }
}

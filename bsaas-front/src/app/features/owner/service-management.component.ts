import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceService } from './service.service';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss'],
})
export class ServiceManagementComponent {
  serviceForm;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      duration: ['', Validators.required],
      price: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.serviceForm.invalid) return;
    this.loading = true;
    this.error = null;
    // Ensure all required fields are present and not null
    const { name, description, duration, price } = this.serviceForm.value;
    if (!name || !description || !duration || !price) {
      this.loading = false;
      this.error = 'All fields are required.';
      return;
    }
    const service = {
      name: name as string,
      description: description as string,
      duration: Number(duration),
      price: Number(price),
    };
    this.serviceService.saveService(service).subscribe({
      next: (res: { success: boolean }) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Service saved!';
        } else {
          this.error = 'Failed to save service.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.userMessage || 'Error saving service.';
      },
    });
  }
}

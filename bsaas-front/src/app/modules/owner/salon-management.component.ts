import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { SalonService } from './salon.service';

@Component({
  selector: 'app-salon-management',
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
  templateUrl: './salon-management.component.html',
  styleUrls: ['./salon-management.component.scss'],
})
export class SalonManagementComponent {
  salonForm;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private salonService: SalonService,
  ) {
    this.salonForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      contact: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      city: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      services: ['', Validators.required],
      ownerId: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.salonForm.invalid) return;
    this.loading = true;
    this.error = null;
    // Ensure all required fields are present and not null
    const { name, address, contact, email, city, latitude, longitude, services, ownerId } = this.salonForm.value;
    if (!name || !address || !contact || !email || !city || !latitude || !longitude || !services || !ownerId) {
      this.loading = false;
      this.error = 'All fields are required.';
      return;
    }
    const salon = {
      name: name as string,
      address: address as string,
      contact: contact as string,
      email: email as string,
      city: city as string,
      latitude: Number(latitude),
      longitude: Number(longitude),
      services: Array.isArray(services) ? services : [services],
      ownerId: ownerId as string,
    };
    this.salonService.saveSalon(salon).subscribe({
      next: (res: { success: boolean }) => {
        this.loading = false;
        if (res.success) {
          this.success = 'Salon saved!';
        } else {
          this.error = 'Failed to save salon.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.userMessage || 'Error saving salon.';
      },
    });
  }
}
